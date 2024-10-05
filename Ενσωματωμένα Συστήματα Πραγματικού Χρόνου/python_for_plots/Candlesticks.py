import matplotlib.pyplot as plt
import pandas as pd
import mplfinance as mpf
import numpy as np

# Define file paths for the four datasets
file_paths = [
    'D:/vs_code_python_projects/t11/GOOGL_candlestick.txt',
    'D:/vs_code_python_projects/t11/BINANCE_BTCUSDT_candlestick.txt',
    'D:/vs_code_python_projects/t11/AAPL_candlestick.txt',
    'D:/vs_code_python_projects/t11/NVDA_candlestick.txt'
]

# Create an empty list to hold the data
data_list = []

# Load the data from each file
for file_path in file_paths:
    # Load the data
    data = pd.read_csv(file_path, sep=r"\s+")
    
    # Set the column names
    data.columns = ['Open', 'Close', 'High', 'Low', 'Volume']
    
    # Replace 'no_data' with NaN to represent missing data
    data.replace('no_data', np.nan, inplace=True)
    
    # Convert the numeric columns to appropriate data types
    data[['Open', 'Close', 'High', 'Low', 'Volume']] = data[['Open', 'Close', 'High', 'Low', 'Volume']].apply(pd.to_numeric, errors='coerce')
    
    # Generate time index
    data.index = pd.date_range(start='2024-10-01 00:00', periods=len(data), freq='min')
    
    # Append the prepared data to the list
    data_list.append(data)

# Define custom market colors
colors = mpf.make_marketcolors(up='#E02BD6',       # Candle color for up
                               down='#E0DE41',     # Candle color for down
                               wick='inherit',     # Wick color
                               edge='inherit')     # Edge color

# Create the mplfinance style with the custom colors
mpf_style = mpf.make_mpf_style(base_mpf_style='nightclouds', marketcolors=colors)

# Create a figure with only four subplots for the price (without volume)
fig = mpf.figure(style='nightclouds', figsize=(12, 16))  # Increased figure height

# Create subplots for prices only
ax1 = fig.add_subplot(2, 2, 1)  # Top-left
ax2 = fig.add_subplot(2, 2, 2)  # Top-right
ax3 = fig.add_subplot(2, 2, 3)  # Bottom-left
ax4 = fig.add_subplot(2, 2, 4)  # Bottom-right

# Plot each dataset on its corresponding price subplots
mpf.plot(data_list[0], type='candle', style=mpf_style, ax=ax1, axtitle='GOOGL', show_nontrading=True, xrotation=0)
mpf.plot(data_list[1], type='candle', style=mpf_style, ax=ax2, axtitle='BTCUSDT', show_nontrading=True, xrotation=0)
mpf.plot(data_list[2], type='candle', style=mpf_style, ax=ax3, axtitle='AAPL', show_nontrading=True, xrotation=0)
mpf.plot(data_list[3], type='candle', style=mpf_style, ax=ax4, axtitle='NVDA', show_nontrading=True, xrotation=0)

# Show the plots
plt.show()
