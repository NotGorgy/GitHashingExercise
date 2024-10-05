# Compiler
CC = arm-linux-gnueabihf-gcc

# Compiler flags
CFLAGS = -g
INCLUDES = -I/home/yorgi/openssl-1.1.1t/openssl-arm/include -I/home/yorgi/libwebsockets/include -I/home/yorgi/libwebsockets/build
LDFLAGS = -L/home/yorgi/openssl-1.1.1t/openssl-arm/lib
LIBS = -lwebsockets -pthread -lssl -lcrypto -ljansson -lm

# Target executable
TARGET = pi_code

# Source file
SRC = pi_code.c

# Default rule
all: $(TARGET)

# Rule to build the target
$(TARGET): $(SRC)
        $(CC) $(CFLAGS) $(INCLUDES) $(SRC) -o $(TARGET) $(LDFLAGS) $(LIBS)

# Clean rule to remove the target
clean:
        rm -f $(TARGET)
