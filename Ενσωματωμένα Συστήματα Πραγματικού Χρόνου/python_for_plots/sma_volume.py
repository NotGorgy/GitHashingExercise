import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Define file paths for the four datasets (GOOGL, AAPL, BINANCE, NVDA in desired order)
file_paths = [
    r'D:\vs_code_python_projects\t11\GOOGL_sma_volume.txt',
    r'D:\vs_code_python_projects\t11\AAPL_sma_volume.txt',
    r'D:\vs_code_python_projects\t11\BINANCE_BTCUSDT_sma_volume.txt',
    r'D:\vs_code_python_projects\t11\NVDA_sma_volume.txt'
]

# Initialize a list to hold the dataframes
data_list = []

# Loop through each file path, read the file and process the data
for file_path in file_paths:
    # Read the data from the file
    df = pd.read_csv(file_path, sep=r"\s+")
    df.columns = ['SMA', 'Volume']  # Set the column names
    
    # Replace 'no_data' with NaN to handle missing data
    df.replace('no_data', np.nan, inplace=True)
    
    # Convert data to numeric (NaNs will be preserved for missing data)
    df = df.apply(pd.to_numeric, errors='coerce')

    # The first 15 values are very inaccurate since the program has not yet run for enough time to collect samples for 15-min
    # Drop the first 15 non-null values (i.e., valid data) in both 'SMA' and 'Volume'
    valid_sma_indices = df['SMA'].dropna().index[:15]
    valid_volume_indices = df['Volume'].dropna().index[:15]
    
    # Combine the indices and drop the rows corresponding to them
    valid_indices_to_drop = valid_sma_indices.union(valid_volume_indices)
    df = df.drop(valid_indices_to_drop)

    # Create a time index
    time_index = pd.date_range(start='2024-10-01 00:00', periods=len(df), freq='min')
    df['Time'] = time_index
    
    # Set 'Time' as the index for plotting
    df.set_index('Time', inplace=True)
    
    # Append the processed dataframe to the list
    data_list.append(df)

# Set the plot style to dark background
plt.style.use('dark_background')

# Create a figure with 4 subplots (2 rows, 2 columns)
fig, axes = plt.subplots(4, 2, figsize=(12, 12))

# Customizing colors and background
fig.patch.set_facecolor('#1A1A1A')  # Darker background color (near-black)

# Titles for the datasets, in the correct order: GOOGL, AAPL, BINANCE, NVDA
titles = ['GOOGL', 'AAPL', 'BTCUSDT', 'NVDA']

# Loop over the dataframes and plot on the respective axes
for i, df in enumerate(data_list):
    # Customize the background of the individual subplots
    axes[i, 0].set_facecolor('#1A1A1A')  # Darker subplot background
    axes[i, 1].set_facecolor('#1A1A1A')  # Darker subplot background
    
    # Plot SMA in the left subplot of each row
    axes[i, 0].plot(df.index, df['SMA'], label='SMA', color='#BE62EA')
    axes[i, 0].set_title(f'{titles[i]} - SMA over Time', color='white')
    axes[i, 0].set_ylabel('SMA', color='white')
    axes[i, 0].tick_params(axis='x', colors='white')
    axes[i, 0].tick_params(axis='y', colors='white')
    
    # Plot Volume in the right subplot of each row
    axes[i, 1].plot(df.index, df['Volume'], label='Volume', color='#62EABF')
    axes[i, 1].set_title(f'{titles[i]} - Volume over Time', color='white')
    axes[i, 1].set_ylabel('Volume', color='white')
    axes[i, 1].tick_params(axis='x', colors='white')
    axes[i, 1].tick_params(axis='y', colors='white')

# Adjust layout to prevent overlap
plt.tight_layout()

# Show the plots
plt.show()
