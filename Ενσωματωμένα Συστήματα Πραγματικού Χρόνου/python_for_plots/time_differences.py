import pandas as pd
import matplotlib.pyplot as plt
import os

# Run for files: finnhub_producer_delay.txt, producer_consumer_delay.txt and candlestick_time_differences.txt
# Depending on the .txt file please modify line 36 according the notes in the comments 
file_path = r'D:\vs_code_python_projects\t11\producer_consumer_delay.txt'  # Path to the input file
output_directory = os.path.dirname(file_path) # Output path 

# Read the input file
with open(file_path, 'r') as file:
    lines = file.readlines()

# Split the header and data into separate lists
header = lines[0].strip().split('\t')
data = [line.strip().split('\t') for line in lines[1:]]

# Create separate files for each column in the same directory
for i, col_name in enumerate(header):
    output_file = os.path.join(output_directory, f'modified_{i+1}.txt')  # Adjusted file naming
    with open(output_file, 'w') as out_file:
        out_file.write(f"{col_name}\n")  # Write the header (column name)
        for row in data:
            if len(row) > i and row[i].strip() != '0':
                out_file.write(f"{row[i]}\n")
    print(f"File {output_file} created.")

# Modify the values in each file (e.g., divide by 1000) and overwrite the files
for i, file_name in enumerate([f'modified_{i+1}.txt' for i in range(4)]):
    file_path = os.path.join(output_directory, file_name)
    
    # Read the file into a pandas DataFrame (skipping the header)
    df = pd.read_csv(file_path, header=None, skiprows=1, names=[header[i]])
    
    # Convert to seconds
    df[header[i]] = df[header[i]].astype(float) / 1000000    # In finnhub_producer_delay.txt unit of measurement is msec, so use '/1000' 
                                                          # In producer_consumer_delay.txt unit of measurement was usec, so use '/1000000' 
                                                          # In candlestick_time_differences.txt unit of measurement was usec, so use '/1000000' 
                                                       
    # Overwrite the original file with modified values
    df.to_csv(file_path, index=False, header=True)
    print(f"File {file_name} modified and updated.")

# Plot the data from the modified files

# Creating paths for the modified files
file_paths = [os.path.join(output_directory, f'modified_{i+1}.txt') for i in range(4)]

# Reading each file and storing it in a list of pandas Series (handling varying lengths)
series_list = []
for i, file_path in enumerate(file_paths):
    col_name = header[i]
    # Read the file into a pandas Series and remove the first row (header)
    series = pd.read_csv(file_path, header=None, skiprows=1, names=[col_name]).squeeze()
    series_list.append(series)

# Create a 2x2 subplot for separate plots
fig, axes = plt.subplots(2, 2, figsize=(12, 8))  # 2x2 grid of subplots

# Set dark gray background for the figure
fig.patch.set_facecolor('#2E2E2E')

# Plot each series data in a different subplot (skip NaNs, since columns might have varying lengths)
axes[0, 0].plot(series_list[0], color='#BE62EA', linewidth=0.5)
axes[0, 0].set_title('GOOGL', color='white')
axes[0, 0].set_facecolor('#2E2E2E')
axes[0, 0].tick_params(axis='x', colors='white')
axes[0, 0].tick_params(axis='y', colors='white')

axes[0, 1].plot(series_list[1], color='#62EABF', linewidth=0.5)
axes[0, 1].set_title('BINANCE:BTCUSDT', color='white')
axes[0, 1].set_facecolor('#2E2E2E')
axes[0, 1].tick_params(axis='x', colors='white')
axes[0, 1].tick_params(axis='y', colors='white')

axes[1, 0].plot(series_list[2], color='#EA6262', linewidth=0.5)
axes[1, 0].set_title('AAPL', color='white')
axes[1, 0].set_facecolor('#2E2E2E')
axes[1, 0].tick_params(axis='x', colors='white')
axes[1, 0].tick_params(axis='y', colors='white')

axes[1, 1].plot(series_list[3], color='#EACA62', linewidth=0.5)
axes[1, 1].set_title('NVDA', color='white')
axes[1, 1].set_facecolor('#2E2E2E')
axes[1, 1].tick_params(axis='x', colors='white')
axes[1, 1].tick_params(axis='y', colors='white')

# Add labels and grid for each subplot
for ax in axes.flat:
    ax.grid(True, color='gray', linestyle='--', linewidth=0.5)
    ax.set_xlabel('Number of Trades', color='white')
    ax.set_ylabel('Time Difference', color='white')

# Adjust layout to avoid overlap
plt.tight_layout()

# Show the plot
plt.show()

# Delete the modified files after use
for i in range(4):
    file_to_delete = os.path.join(output_directory, f'modified_{i+1}.txt')
    if os.path.exists(file_to_delete):  # Check if the file exists
        os.remove(file_to_delete)  # Remove the file
        print(f"File {file_to_delete} deleted.")
