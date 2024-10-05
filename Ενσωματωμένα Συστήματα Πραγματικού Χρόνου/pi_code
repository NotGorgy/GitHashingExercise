#include <pthread.h>
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <libwebsockets.h>
#include <jansson.h>
#include <math.h>
#include <signal.h>

#define QUEUESIZE 500
#define MAX_SYMBOL_LEN 30
#define NUMBER_OF_SYMBOLS 4
#define PING_LIMIT 2

#define COLOR_RED     "\x1b[31m"
#define COLOR_GREEN   "\x1b[32m"
#define COLOR_YELLOW  "\x1b[33m"
#define COLOR_BLUE    "\x1b[34m"
#define COLOR_MAGENTA "\x1b[35m"
#define COLOR_RESET   "\x1b[0m"

// Struct to hold stock data such as symbol, price, volume, time 
typedef struct {
    char symbol[MAX_SYMBOL_LEN];    // Enough space for the stock symbol 
    double price;                    
    long long int time;              
    double volume;                   
    long long int recv_time;    // Time when data were received by the producer and added to the fifo queue
} stock_data_t;

// Struct to hold candlestick data 
typedef struct {
  double open_price;
  double close_price;
  double high_price;
  double low_price;
  double volume;
  int first;    // Flag to indicate the first entry for the candlestick
} candlestick_t;

// Queue struct for shared buffer between producer and consumers
typedef struct {
  stock_data_t buf[QUEUESIZE];  // Buffer holding stock data
  long head, tail;
  int full, empty;
  pthread_mutex_t *mut;
  pthread_cond_t *notFull, *notEmpty;
} queue;

// Stock symbol subscription messages
const char *sympol_message[] = {"{\"type\":\"subscribe\",\"symbol\":\"GOOGL\"}", "{\"type\":\"subscribe\",\"symbol\":\"BINANCE:BTCUSDT\"}", "{\"type\":\"subscribe\",\"symbol\":\"AAPL\"}", "{\"type\":\"subscribe\",\"symbol\":\"NVDA\"}"};
// Stock symbols being tracked
const char *stock_symbols[] = { "GOOGL", "BINANCE:BTCUSDT", "AAPL", "NVDA" };

// Global variables, arrays, structures, etc.
int connection_flag = 1;  
int continues_pings = 0;
int count[NUMBER_OF_SYMBOLS] = {0}; 
int skip = 0;
int termination = 0;
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER; 

queue *fifo; 
struct lws_context *context;

candlestick_t candlestick[NUMBER_OF_SYMBOLS] = {0};
int sympol_counter[NUMBER_OF_SYMBOLS] = {0}; 
double price_sum[NUMBER_OF_SYMBOLS] = {0};
double sma_1min[NUMBER_OF_SYMBOLS][15] = {0};
double volume_1min[NUMBER_OF_SYMBOLS][15] = {0};
double volume_15min[NUMBER_OF_SYMBOLS] = {0};
double sma_15min[NUMBER_OF_SYMBOLS] = {0};

// File pointers for logging
FILE *file[NUMBER_OF_SYMBOLS];              
FILE *file_candlestick[NUMBER_OF_SYMBOLS];
FILE *file_sma_volume[NUMBER_OF_SYMBOLS];
FILE *candlestick_time_diff;
FILE *file_fin_pro_delay;
FILE *file_pro_con_delay;

// Producer and consumer function declarations
void *producer ();
void *consumer_read_data ();
void *sleepyhead ();

// Queue function declarations
queue *queueInit (void);
void queueDelete (queue *q);
void queueAdd (queue *q, stock_data_t in);
void queueDel (queue *q, stock_data_t *out);

// Function declarations for various operations
void process_trade(stock_data_t trade, candlestick_t *candlestick);
void create_txt_files();
void handle_sigint(int sig);
void send_message(struct lws *wsi, const char *message);
void parse_json_data(const char *json_text);
static int callback_ws(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t len);
void create_client();

// WebSocket protocol setup
static struct lws_protocols protocols[] = {
    {
        "ws-protocol",   // Name of the protocol
        callback_ws,     // The callback function
        0,               // Size of user session data (not used)
        0,               // Maximum frame size received (not used)
    },
    { NULL, NULL, 0, 0 } // End of list
};

// Main function to initialize threads and handle signal interruptions
int main ()
{
  signal(SIGINT, handle_sigint); // Handle Ctrl+C to cleanly exit

  pthread_t pro, con, sleepy;     // Declare thread identifiers

  // Initialize first-time flags for candlestick tracking
  for(int i = 0; i < NUMBER_OF_SYMBOLS; i++) {
    candlestick[i].first = 1;
  }

  create_txt_files();   // Create necessary files

  fifo = queueInit ();
  if (fifo ==  NULL) {
      fprintf (stderr, COLOR_RED"main: Queue Init failed.\n"COLOR_RESET);
      exit (1);
  }
  
  create_client(); // Initialize WebSocket client

  // Create producer and consumer threads
  pthread_create (&pro, NULL, producer, NULL);
  pthread_create (&con, NULL, consumer_read_data, NULL);
  pthread_create (&sleepy, NULL, sleepyhead, NULL);

  // Wait for threads to finish
  pthread_join (pro, NULL);
  pthread_join (con, NULL);
  pthread_join (sleepy, NULL);

  // Close all files associated with each stock symbol
  for(int i = 0; i < NUMBER_OF_SYMBOLS; i++) {
    fclose(file[i]);
    fclose(file_candlestick[i]);
    fclose(file_sma_volume[i]);
  }

  // Close other global files
  fclose(candlestick_time_diff);
  fclose(file_fin_pro_delay);
  fclose(file_pro_con_delay);

  // Clean up
  queueDelete (fifo);

  return 0;
}

// Producer function responsible for WebSocket communication and queueing data
void *producer ()
{
  int count_attempts = 0;
  while(!termination) {
    lws_service(context, 1000); // Service the WebSocket connection
      
    if(connection_flag == 0 || connection_flag == -1) { 
        // Connection issue, re-create client
        lws_cancel_service(context);
        lws_context_destroy(context);
        create_client();
    } 

    // Handle reconnection attempts
    if(connection_flag != 1) {
      count_attempts += 1;  // Count continuous failed reconnection attempts
      printf(COLOR_YELLOW"\nTRYING TO RECONNECT\n"COLOR_RESET);

      if(count_attempts > 10){  // Too many failed attempts, sleep for 10-sec
        sleep(10);
      }

      // Waiting to reconnect
      while (1) {
        lws_service(context, 1000);
        
        if(connection_flag == 1) { // Reconnection completed
          count_attempts = 0;
          break;
        } 

        if(connection_flag == -1) { // Client connection error, need to re-create client
          usleep(500000);
          connection_flag = 0;
          break;
        }
 
        if(termination) { // Clean up WebSocket context and exit function
          lws_cancel_service(context);
          lws_context_destroy(context);
          return (NULL);
        }
      }
    }
  }

  // Clean up WebSocket context and exit function
  lws_cancel_service(context);
  lws_context_destroy(context);
  return (NULL);
}

// Save 1-minute aggregated data (candlestick, SMA, volume)
void *sleepyhead () 
{
    int ret;
    struct timespec timeout; // Used to wake up the function
    struct timeval prev_time[NUMBER_OF_SYMBOLS], current_time[NUMBER_OF_SYMBOLS]; // Used to capture the time difference between candlestick saves
    long long int time_diff;

    for(int i = 0; i < NUMBER_OF_SYMBOLS; i++) {
      gettimeofday(&prev_time[i], NULL);
    }

    while (!termination) {
        clock_gettime(CLOCK_REALTIME, &timeout); // Get current time
        timeout.tv_sec += 60;                    // Set timeout to 60 seconds (1 minute)

        pthread_mutex_lock(&lock);  // The mutexed isn't really used, but the function 'pthread_cond_timedwait()' required it

        // Wait for the condition to be signaled or for the timeout to expire
        while (!termination) {
            ret = pthread_cond_timedwait(&cond, &lock, &timeout);
            if (ret == ETIMEDOUT) {
                break; // Timeout occurred
            }
        }

        pthread_mutex_unlock(&lock);

        if (termination) {
            break; // Break out of the loop if termination is signaled
        }

        // Process each stock symbol
        for(int i = 0; i < NUMBER_OF_SYMBOLS; i++) {
            // No data received from a sympol, try reconnecting
            if(sympol_counter[i] == 0) {
                connection_flag = 0;
                fprintf(file_candlestick[i], "no_data\n");
                fprintf(candlestick_time_diff, "0\t");
                fprintf(file_sma_volume[i], "no_data\n");
                skip = 1;   // Indicate to not save candlestick[i], because there are no data collected
            }

            if(skip == 0) {
                count[i] += 1;  //  Count how many times a candlestick is saved for each symbol
                volume_1min[i][count[i]%15] = candlestick[i].volume;   // Store the last 15 1-min volumes
                sma_1min[i][count[i]%15] = price_sum[i]/sympol_counter[i];   // Store the last 15 1-min SMAs

                // Calculate 15-min total volume and SMA
                for(int j = 0; j < 15; j++) {              
                    volume_15min[i] += volume_1min[i][j];
                    sma_15min[i] += sma_1min[i][j];
                }
                sma_15min[i] = sma_15min[i]/15.0;

                // Save candlestick, SMA, and total volume to files
                fprintf(file_candlestick[i], "%.4f\t%.4f\t%.4f\t%.4f\t%.4f\n", 
                        candlestick[i].open_price, candlestick[i].close_price, candlestick[i].high_price, candlestick[i].low_price, candlestick[i].volume); 
                fprintf(file_sma_volume[i], "%.4f\t%.4f\n", sma_15min[i], volume_15min[i]);

                // Calculate and save the time difference between the currunt and previous candlestick save for each symbol
                gettimeofday(&current_time[i], NULL);
                time_diff = (long long)current_time[i].tv_sec * 1000000LL + current_time[i].tv_usec - ((long long)prev_time[i].tv_sec * 1000000LL + prev_time[i].tv_usec);
                prev_time[i] = current_time[i];

                fprintf(candlestick_time_diff, "%lld\t", time_diff);

                // Print candlestick, SMA, and total volume to files 
                printf (COLOR_MAGENTA"CANDLESTICK, SMA, VOLUME:\n"COLOR_RESET);
                printf("%s: SMA_(15-min): %.4f, Volume_(15-min): %.4f\n", stock_symbols[i], sma_15min[i], volume_15min[i]);
                printf("Open_Price: %.4f, Close_Price: %.4f, High_Price: %.4f, Low_Price: %.4f, Volume: %.4f\n\n", 
                    candlestick[i].open_price, candlestick[i].close_price, candlestick[i].high_price, candlestick[i].low_price, candlestick[i].volume);
            }
            skip = 0; // Reset flag

            // Reset candlestick data for next minute
            memset(&candlestick[i], 0, sizeof(candlestick_t));
            candlestick[i].first = 1;
        }
        fprintf(candlestick_time_diff, "\n"); 

        // Reset arrays for next minute
        memset(volume_15min, 0, sizeof(volume_15min));
        memset(sma_15min, 0, sizeof(sma_15min));
        memset(price_sum, 0, sizeof(price_sum));       
        memset(sympol_counter, 0, sizeof(sympol_counter)); 
    }
    return (NULL);
}

void *consumer_read_data ()
{
  stock_data_t trade; 

  struct timeval time_val;
  long long int str_time;   // Time when data were received by the consumer and stored
  long long int fin_to_pro_delay, pro_to_con_delay; // Calculate the delay between finnhub-producer and produre-consumer

  while(!termination) {
    pthread_mutex_lock (fifo->mut); // Lock the mutex to ensure exclusive access to the shared queue
    // If the queue is empty, wait for a producer to signal it
    while (fifo->empty) {
        pthread_cond_wait (fifo->notEmpty, fifo->mut);
        if(termination) { // Close thread if termination flag is set
            pthread_mutex_unlock (fifo->mut);
            return (NULL);
        } 
    }
    queueDel (fifo, &trade);    // Remove (consume) the trade data from the queue
    pthread_mutex_unlock (fifo->mut);    // Unlock the mutex after accessing the shared resource
    pthread_cond_signal (fifo->notFull);    // Signal the producer that the queue is no longer full (room for more items)
    

    // Loop through all stock symbols to find the matching symbol
    for(int i = 0; i < NUMBER_OF_SYMBOLS; i++) {
      if(strcmp(trade.symbol, stock_symbols[i]) == 0) {
        // Write the trade details (price, volume, time) to the corresponding file
        fprintf(file[i], "%.4f\t%.4f\t\t%lld\n",
                trade.price, trade.volume, trade.time);

        gettimeofday(&time_val, NULL);  // Get the time when date were stored
        str_time = (long long)time_val.tv_sec * 1000000LL + time_val.tv_usec;

        // Calculate the delay between finnhub-producer and produre-consumer
        fin_to_pro_delay = (long long)(trade.recv_time / 1000) - trade.time;    // Calculate in ms
        pro_to_con_delay = str_time - trade.recv_time ;                         // Calculate in us

        // Log the time when the trade data was received and stored
        fprintf(file_fin_pro_delay, "%lld\t", fin_to_pro_delay);
        fprintf(file_pro_con_delay, "%lld\t", pro_to_con_delay);
        
        // Update symbol counters and price summation 
        sympol_counter[i] += 1;
        price_sum[i] = price_sum[i] + trade.price;

        /*// Print each trade 
        printf (COLOR_BLUE"%s\n"COLOR_RESET, trade.symbol);
        printf("Price: %.4f\n", trade.price);
        printf("Time: %lld\n", trade.time);
        printf("Volume: %4f\n", trade.volume);*/

        // Process the trade data to update the candlestick
        process_trade(trade, &candlestick[i]);
      } else {
      fprintf(file_fin_pro_delay, "0\t");
      fprintf(file_pro_con_delay, "0\t");
      }
  }
  fprintf(file_fin_pro_delay, "\n");
  fprintf(file_pro_con_delay, "\n");
  }
  return (NULL);
}

// Function to handle SIGINT (Ctrl+C) and clean up resources
void handle_sigint(int sig)
{
  termination = 1;  // Indicate that the programm should begin shutting down 
  // Unstuck/wake up threads that are waiting
  pthread_cond_signal (fifo->notFull);
  pthread_cond_signal (fifo->notEmpty);
  pthread_cond_signal (&cond);
}

// Function to create text files
void create_txt_files() 
{
  // Open the file for logging the time diff
  candlestick_time_diff = fopen("candlestick_time_differences.txt", "w");
  if (candlestick_time_diff == NULL) {
    perror("Error opening time_receive.txt");
    exit(1); 
  }

  // Open the file for logging the time when data is received
  file_fin_pro_delay = fopen("finnhub_producer_delay.txt", "w");
  if (file_fin_pro_delay == NULL) {
    perror("Error opening time_receive.txt");
    exit(1); 
  }

  // Open the file for logging the current system time when data is stored
  file_pro_con_delay = fopen("producer_consumer_delay.txt", "w");
  if (file_pro_con_delay == NULL) {
    perror("Error opening time_stored.txt");
    exit(1); 
  }

   // Create the necessary files for each symbol
  for (int i = 0; i < NUMBER_OF_SYMBOLS; i++) {
      char filename[70];
      char filename_cs[70];
      char filename_sma_volume[70];
      char filename_candlestick_time_diff[70];
      snprintf(filename, sizeof(filename), "%s.txt", stock_symbols[i]);
      snprintf(filename_cs, sizeof(filename_cs), "%s_candlestick.txt", stock_symbols[i]);
      snprintf(filename_sma_volume, sizeof(filename_sma_volume), "%s_sma_volume.txt", stock_symbols[i]);
      snprintf(filename_candlestick_time_diff, sizeof(filename_candlestick_time_diff), "%s_candlestick_time_diff.txt", stock_symbols[i]);

      file[i] = fopen(filename, "w");
      if (file[i] == NULL) {
        perror("Error opening file");
        exit(1);
      }

      file_candlestick[i] = fopen(filename_cs, "w");
      if (file_candlestick[i] == NULL) {
        perror("Error opening file");
        exit(1);
      }

      file_sma_volume[i] = fopen(filename_sma_volume, "w");
      if (file_sma_volume[i] == NULL) {
        perror("Error opening file");
        exit(1);
      }

      // Set headers for each file to label the columns
      fprintf(file[i], "Price\t\tVolume\t\tTime\n"); 
      fprintf(file_candlestick[i], "Open\t\tClose\t\tHigh\t\tLow\t\tVolume\n"); 
      fprintf(file_sma_volume[i], "SMA\t\tVolume\n"); 
      fprintf(candlestick_time_diff, "%s\t", stock_symbols[i]); 
      fprintf(file_fin_pro_delay, "%s\t", stock_symbols[i]); 
      fprintf(file_pro_con_delay, "%s\t", stock_symbols[i]); 
  }
  fprintf(candlestick_time_diff, "\n");
  fprintf(file_fin_pro_delay, "\n");
  fprintf(file_pro_con_delay, "\n");
}

void process_trade(stock_data_t trade, candlestick_t *candlestick) {
  // Update the candlestick data
  candlestick->close_price = trade.price;
  candlestick->high_price = fmax(candlestick->high_price, trade.price);
  candlestick->low_price = fmin(candlestick->low_price, trade.price);
  candlestick->volume += trade.volume;

  // If this is the first trade in the 1-min period, initialize the candlestick
  if(candlestick->first == 1){
    candlestick->open_price = trade.price;
    candlestick->low_price = trade.price;
    candlestick->high_price = trade.price;
    candlestick->first = 0; // Mark that the first trade has been processed
  }
}

void send_message(struct lws *wsi, const char *message) {
    size_t message_len = strlen(message);      // Get the length of the message
    unsigned char buf[LWS_PRE + message_len];  // Buffer with padding (LWS_PRE) required by libwebsockets
    unsigned char *p = &buf[LWS_PRE];          // Pointer to the position after the padding

    memcpy(p, message, message_len);  // Copy the message into the buffer
    lws_write(wsi, p, message_len, LWS_WRITE_TEXT); // Send the message through the WebSocket
}

// Function to parse JSON data and extract trade information (symbol, price, time, volume)
void parse_json_data(const char *json_text) {
    struct timeval time_val;
    json_t *root, *data, *symbol, *price, *time, *volume;   // JSON objects to hold parsed data
    json_error_t error;         // Error object for handling JSON parsing errors
    size_t i;                   // Loop variable
    stock_data_t trade;         // Structure to hold trade data

    // Load the JSON data
    root = json_loads(json_text, 0, &error);
    if (!root) {
        fprintf(stderr, COLOR_RED"error: on line %d: %s\n"COLOR_RESET, error.line, error.text);
        return;
    }

     // Extract the "data" field from the JSON object (expected to be an array)
    json_t *JSON_data = json_object_get(root, "data");
    if (!json_is_array(JSON_data)) {
        fprintf(stderr, COLOR_RED"error: root is not an array\n"COLOR_RESET);
        json_decref(root);   // Free JSON object memory
        
        // Continuous pings mean no data from stocks
        // Check if the number of continuous pings has exceeded the limit
        continues_pings += 1;
        if(continues_pings > PING_LIMIT){
            connection_flag = 0;    // Proceed to disconnect and reconnet
        }
        return;
    }
    continues_pings = 0; // Reset ping counter on valid data

    // Loop through each item in the "data" array
    for (i = 0; i < json_array_size(JSON_data); i++) {
        data = json_array_get(JSON_data, i);    // Get the ith element from the array
        if (!json_is_object(data)) {            // Ensure the element is an object
            fprintf(stderr, COLOR_RED"error: data %zu is not an object\n"COLOR_RESET, i + 1);
            json_decref(root);                  // Free JSON object memory
            return;
        }

         // Extract the "s" (symbol) field
        symbol = json_object_get(data, "s");
        if (!json_is_string(symbol)) {
            fprintf(stderr, COLOR_RED"error: symbol is not a string\n"COLOR_RESET);
            json_decref(root);
            return;
        }

        // Extract the "p" (price) field
        price = json_object_get(data, "p");
        if (!json_is_number(price)) {
            fprintf(stderr, COLOR_RED"error: price is not a number\n"COLOR_RESET);
            json_decref(root);
            return;
        }

        // Extract the "v" (volume) field
        volume = json_object_get(data, "v");
        if (!json_is_number(volume)) {
            fprintf(stderr, COLOR_RED"error: time is not a string\n"COLOR_RESET);
            json_decref(root);
            return;
        }

        // Extract the "t" (time) field
        time = json_object_get(data, "t");
        if (!json_is_integer(time)) {
            fprintf(stderr, COLOR_RED"error: time is not a string\n"COLOR_RESET);
            json_decref(root);
            return;
        }

        // Save data in structure
        strncpy(trade.symbol, json_string_value(symbol), MAX_SYMBOL_LEN - 1);
        trade.symbol[MAX_SYMBOL_LEN - 1] = '\0'; // Ensure null-termination
        trade.price = json_number_value(price);
        trade.time = json_integer_value(time);
        trade.volume = json_number_value(volume);

        // Capture time when data are received by the producer and added to the shared queue
        gettimeofday(&time_val, NULL);           
        trade.recv_time = (long long)time_val.tv_sec * 1000000LL + time_val.tv_usec;

        // Lock the queue mutex before modifying the shared queue      
        pthread_mutex_lock (fifo->mut);
        
        while (fifo->full) {
          pthread_cond_wait (fifo->notFull, fifo->mut);
          if(termination) { // If termination flag is raised return
            json_decref(root);
            return;
          }
        }

        if(!termination) {  
        queueAdd (fifo, trade); // Add the new trade data to the queue
        pthread_mutex_unlock (fifo->mut);   // Unlock the queue mutex after adding data
        pthread_cond_signal (fifo->notEmpty);    // Signal that the queue is no longer empty
        } else {  // If termination flag is raised return
          json_decref(root);
          return;
        }
    }

    // Free JSON object memory
    json_decref(root);
}

// WebSocket callback function for handling events from the WebSocket
static int callback_ws(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t len) {
    switch (reason) {
        case LWS_CALLBACK_CLIENT_ESTABLISHED:   // Event: Connection established
            printf(COLOR_GREEN"\nConnection established\n"COLOR_RESET);
            connection_flag = 1;                // Set connection flag to indicate active connection
            lws_callback_on_writable(wsi);      // Mark the connection as writable
            break;

        case LWS_CALLBACK_CLIENT_RECEIVE:       // Event: Message received from server
            //printf(COLOR_YELLOW"Received message\n" COLOR_RESET); 
            // Parse the received JSON data
            parse_json_data((char *)in);
            break;

        case LWS_CALLBACK_CLIENT_WRITEABLE:      // Event: Ready to send data
            // Send subscription messages for all stock symbols
            for(int i = 0; i < NUMBER_OF_SYMBOLS; i++){
              send_message(wsi, sympol_message[i]);
            }
            break;

        case LWS_CALLBACK_CLIENT_CLOSED:    // Event: Connection closed 
            connection_flag = 0;            // Set connection flag to zero to try reconnecting
            printf(COLOR_RED"Connection closed\n"COLOR_RESET);
            break;

        case LWS_CALLBACK_CLIENT_CONNECTION_ERROR:  // Event: Connection error occurred
            connection_flag = -1;                   // Set connection flag to indicate error
            printf(COLOR_RED"Client connection error\n"COLOR_RESET);
            break;

        default:
            break;
    }
    return 0;
}

// Function to create a WebSocket client and establish a connection
void create_client() {
    struct lws_context_creation_info context_creation_info;
    struct lws_client_connect_info client_connect_info;
    struct lws *wsi;

    // Initialize context information
    memset(&context_creation_info, 0, sizeof(context_creation_info));
    context_creation_info.protocols = protocols;
    context_creation_info.port = CONTEXT_PORT_NO_LISTEN;
    context_creation_info.options = LWS_SERVER_OPTION_DO_SSL_GLOBAL_INIT;

    // Create the context
    context = lws_create_context(&context_creation_info);
    if (context == NULL) {
        printf(COLOR_RED"Error creating context information\n"COLOR_RESET);
        exit(1);
    }

    // Initialize client connection info structure
    memset(&client_connect_info, 0, sizeof(client_connect_info));
    client_connect_info.context = context;
    client_connect_info.address = "ws.finnhub.io";
    client_connect_info.path = "/?token=cr7nsa1r01qotnb3qq60cr7nsa1r01qotnb3qq6g";  // Path with token
    client_connect_info.port = 443;
    client_connect_info.host = client_connect_info.address;     // Host address
    client_connect_info.origin = client_connect_info.address;   // Origin for the WebSocket connection
    client_connect_info.protocol = protocols[0].name;   // WebSocket protocol to use
    client_connect_info.ssl_connection = LCCSCF_USE_SSL;    // Use SSL for connection
    client_connect_info.userdata = fifo;                // Pass the fifo queue as user data

    // Create the WebSocket connection
    wsi = lws_client_connect_via_info(&client_connect_info);
    if (wsi == NULL) {                   // Check if connection failed
        printf(COLOR_RED"Failed to establish connection\n"COLOR_RESET);
        lws_context_destroy(context);    // Destroy the context if connection fails
        exit(1);                        // Exit with an error code
    }
}

queue *queueInit (void)
{
  queue *q;

  q = (queue *)malloc (sizeof (queue));
  if (q == NULL) return (NULL);

  q->empty = 1;
  q->full = 0;
  q->head = 0;
  q->tail = 0;
  q->mut = (pthread_mutex_t *) malloc (sizeof (pthread_mutex_t));
  pthread_mutex_init (q->mut, NULL);
  q->notFull = (pthread_cond_t *) malloc (sizeof (pthread_cond_t));
  pthread_cond_init (q->notFull, NULL);
  q->notEmpty = (pthread_cond_t *) malloc (sizeof (pthread_cond_t));
  pthread_cond_init (q->notEmpty, NULL);
	
  return (q);
}

void queueDelete (queue *q)
{
  pthread_mutex_destroy (q->mut);
  free (q->mut);	
  pthread_cond_destroy (q->notFull);
  free (q->notFull);
  pthread_cond_destroy (q->notEmpty);
  free (q->notEmpty);
  free (q);
}

void queueAdd (queue *q, stock_data_t in)
{
  q->buf[q->tail] = in;
  q->tail++;
  if (q->tail == QUEUESIZE)
    q->tail = 0;
  if (q->tail == q->head)
    q->full = 1;
  q->empty = 0;

  return;
}

void queueDel (queue *q, stock_data_t *out)
{
  *out = q->buf[q->head];

  q->head++;
  if (q->head == QUEUESIZE)
    q->head = 0;
  if (q->head == q->tail)
    q->empty = 1;
  q->full = 0;

  return;
}
  
