import csv
import json


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
    start_index = -1
    with open(path, encoding='utf-8') as csvf:
        # load csv file data using csv library's dictionary reader
        csv_reader = csv.DictReader(csvf, delimiter='\t', fieldnames=fields)
        for i, row in enumerate(csv_reader):
            if row['qseqid'] == fasta_id:
                match_rows.append(row)

    for row in match_rows:
        if len(row['ssciname']) > 20:
            row['ssciname'] = row['ssciname'][0:20] + "..."
    return match_rows

def load_summary(dataset_id):
    """Load a dataset summary"""
    with open("./sample_data/summary.txt", "r") as summary:
        lines = summary.readlines()
    
    return "".join(lines)

def load_user_config():
    """Load a user config"""
    with open("./sample_data/sample_config.json", "r") as file:
        lines = file.readlines()
    
    return "".join(lines)

