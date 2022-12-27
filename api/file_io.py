import csv
from dataclasses import field
import json
import os
from flask import jsonify

def get_baseurl(my_id):
    my_id = int(my_id)
    return os.listdir("./datasets")[my_id - 1]

def load_dataset_folders():
    datasets = []
    for i, file in enumerate(os.listdir("./datasets")):
        obj = os.path.join("./datasets", file)
        if os.path.isdir(obj) and file != "README.md":
            datasets.append({'id': i + 1, 'title': str(obj).replace("./datasets", "").replace("\\", "")})
    return datasets


def convert_csv_to_json(path):
    """Load the main scatterplot datafile and convert it to JSON"""
    with open(path, encoding='utf-8') as csvf:
        # load csv file data using csv library's dictionary reader
        csv_reader = csv.DictReader(csvf)
        labeled_dict = dict()

        for row in csv_reader:
            if row['plot_label'] in labeled_dict.keys():
                labeled_dict[row['plot_label']].append(row)
            else:
                labeled_dict[row['plot_label']] = [row]

    traces_list = []
    for key in labeled_dict.keys():
        traces_list.append(labeled_dict[key])

    return traces_list


def fast_fasta_loader(path, fasta_id):
    """Load fasta sequence data"""
    seq = ""
    start_index = -1

    with open(path, "r") as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            lines[i] = line.rstrip()

    for i, line in enumerate(lines):
        if line.startswith(">" + fasta_id):
            start_index = i
            break

    if start_index == -1:
        return ""

    for i in range(start_index + 1, len(lines)):
        if not lines[i].startswith(">"):
            seq += lines[i]
        else:
            break

    return seq


def taxonomic_hits_loader(fasta_id, path):
    """Load all taxonomic hits"""
    fields = ['qseqid', 'sseqid', 'pident', 'length', 'mismatch', 'gapopen', 'qstart', 'qend', 'sstart', 'send',
              'evalue', 'bitscore', 'staxids', 'ssciname']
    match_rows = []

    with open(path, encoding='utf-8') as csvf:
        for line in csvf:
            try: 
                data = line.split('\t')
                # find matching IDs
                if data[0] == fasta_id:
                    temp = dict()
                    for i, data_field in enumerate(data):
                        temp[fields[i]] = data_field
                    match_rows.append(temp)
            except Exception as e:
                print(e)
                continue
    
    return match_rows

def load_summary(dir):
    """Load a dataset summary"""
    with open(f"./datasets/{dir}/summary.txt", "r") as summary:
        lines = summary.readlines()
    
    return "".join(lines)

def load_user_config(dataset_id):
    """Load a user config"""
    base_path = get_baseurl(dataset_id)
    with open(f"./datasets/{base_path}/user.json", "r") as file:
        lines = file.readlines()
    
    return "".join(lines)

def parse_user_config(dataset_id):
    """Parse user config to JSON"""
    base_path = get_baseurl(dataset_id)
    with open(f"./datasets/{base_path}/user.json", "r") as file:
        data = json.load(file)
    return data

def write_user_config(json_data, dataset_id):
    """Write user config to disk"""
    base_path = get_baseurl(dataset_id)
    print(base_path)
    with open(f"./datasets/{base_path}/user.json", 'w') as json_file:
        json.dump(json_data, json_file)

def load_pca_coords(base_path):
    """3D plot of variable contribution"""
    with open(f"./datasets/{base_path}/pca_loadings.csv", 'r') as file:
        lines = file.readlines()
    
    final_lines = []
    for line in lines[1:-1]:
        fields = line.split(",")
        new_dict = dict()
        new_dict['label'] = fields[0]
        new_dict['x'] = [fields[1]]
        new_dict['y'] = [fields[2]]
        new_dict['z'] = [fields[3]]
        final_lines.append(new_dict)
    
    return final_lines

def indexed_data(path):
    """Load the main scatterplot datafile and convert it to JSON"""
    with open(path, encoding='utf-8') as csvf:
        # load csv file data using csv library's dictionary reader
        csv_reader = csv.DictReader(csvf)
        labeled_dict = dict()

        for row in csv_reader:
            labeled_dict[row['g_name']] = row


    return labeled_dict

