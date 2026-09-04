import csv
import json
import pandas as pd

TARGET_ADDRESS = './Config/Json/'

srcFile = pd.read_excel(f'./Config/PicChooseConfig.xlsx', sheet_name=None)

for sheet_name, df in srcFile.items():
    json_data = df.to_json(orient='records', indent=4, force_ascii=False)
    with open(f'{TARGET_ADDRESS}{sheet_name}.json', 'w+', encoding='utf-8') as f:
        f.write(json_data)