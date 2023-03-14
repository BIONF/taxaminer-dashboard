import json
import os
import shutil
import threading
import zipfile
import tarfile
import flask
import file_io
from flask import request, jsonify, send_file, abort
from flask.wrappers import Response
from flask_cors import CORS, cross_origin

# flask server
app = flask.Flask(__name__)

# lock files
lock = threading.Lock()

# absence of CORS headers might interfere with the webkit server
cors = CORS(app)
app.config["DEBUG"] = True
app.config['CORS_HEADERS'] = 'Content-Type'


DEFAULT_CONFIG = '{"custom_fields": [], "selection": []}'


@app.route('/', methods=['GET'])
def home():
    return '''<h1>taXaminer API</h1>
<p>A prototype API for accessing taXaminer results</p>'''


@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found.</p>", 404


@app.route('/api/v1/data/datasets', methods=['GET'])
@cross_origin()
def datasets():
    query_parameters = request.args
    json_data = file_io.load_dataset_folders()

    # return as json
    return jsonify(json_data)


@app.route('/api/v1/data/upload', methods=['POST'])
@cross_origin()
def upload_file():
    """Upload required input files"""

    # file params
    my_file = request.files['files']
    file_name = request.form['name']
    file_type = request.form['type']
    keep_zip = bool(int(request.form['keep_zip']))

    temp_path = "./temp/" + file_name + file_type

    # jump to the flask working dir and save with predefined filename
    my_file.save(temp_path)

    # unzip
    if temp_path.endswith(".zip"):
        with zipfile.ZipFile(temp_path, 'r') as zip_ref:
            zip_ref.extractall("./temp/" + file_name + "/")
    elif temp_path.endswith(".tar.gz"):
        with tarfile.TarFile(temp_path, 'r') as tar_ref:
            tar_ref.extractall("./temp/" + file_name + "/")
    
    # copy to dataset folder
    try:
        os.renames(f"./temp/{file_name}/taxonomic_hits.txt", f"./datasets/{file_name}/taxonomic_hits.txt")
        os.renames(f"./temp/{file_name}/proteins.faa", f"./datasets/{file_name}/proteins.faa")
        os.renames(f"./temp/{file_name}/taxonomic_assignment/gene_table_taxon_assignment.csv", f"./datasets/{file_name}/gene_table_taxon_assignment.csv")
        os.renames(f"./temp/{file_name}/gene_info/summary.txt", f"./datasets/{file_name}/summary.txt")
        os.renames(f"./temp/{file_name}/PCA/contribution_of_variables.csv", f"./datasets/{file_name}/contribution_of_variables.csv")

        if keep_zip:
            os.renames(f"./temp/{file_name}.zip", f"./datasets/{file_name}/{file_name}.zip")
        else:
            os.remove(f"./temp/{file_name}.zip")

        # clean up
        shutil.rmtree("./temp/" + file_name + "/")

    except FileNotFoundError as e:
        print(e)
        return abort(500)

    # create default config file
    with open(f"./datasets/{file_name}/user.json", 'w') as file:
        file.write(DEFAULT_CONFIG)

    # return as json
    return jsonify("OK")


@app.route('/data/path', methods=['PUT'])
@cross_origin()
def add_path():
    query_parameters = request.args
    payload = request.get_json()
    path = payload['path']
    name = payload['name']
    if not file_io.validate_path(path):
        return abort(404)

    # create directory
    os.mkdir(f"./datasets/{name}")
    # link files
    file_io.symlink_taxaminer(src_path=path, dataset_name=name)

    with open(f"./datasets/{name}/user.json", 'w') as file:
        file.write(DEFAULT_CONFIG)
    
    return "OK"


@app.route('/data/verify_path', methods=['GET'])
@cross_origin()
def verify_path():
    query_parameters = request.args
    my_path = query_parameters.get("path")

    if file_io.validate_path(my_path):
        return jsonify({"valid": True})
    else:
        return jsonify({"valid": False})

@app.route('/api/v1/data/remove', methods=['GET'])
@cross_origin()
def remove_datasets():
    query_parameters = request.args
    my_id = query_parameters.get("id")
    my_dir = file_io.get_baseurl(my_id)

    data_dir = "./datasets/" + my_dir + "/"
    candidates = os.listdir(data_dir)

    # remove symlinks safely
    for candidate in candidates:
        if os.path.islink(data_dir + candidate):
            os.unlink(data_dir + candidate)

    # remove file tree
    try:
        shutil.rmtree("./datasets/" + my_dir)
        # return as json
        return "Success"
    except Exception as e:
        return e


@app.route('/api/v1/data/scatterplot', methods=['GET'])
@cross_origin()
def api_filter():
    """
    Filtered scatterplot data
    :return: requested data as JSON string
    """
    query_parameters = request.args
    my_id = query_parameters.get("id")
    my_dir = file_io.get_baseurl(my_id)

    json_data = file_io.convert_csv_to_json(f"./datasets/{my_dir}/gene_table_taxon_assignment.csv")

    # return as json
    return jsonify(json_data)


@app.route('/api/v1/data/main', methods=['GET'])
@cross_origin()
def main_data():
    """
    Filtered main data
    :return: requested data as JSON string
    """
    query_parameters = request.args

    my_id = query_parameters.get("id")
    if not my_id:
        return abort(404)
    else:
        my_id = int(my_id)
        my_dir = file_io.get_baseurl(int(my_id))
        json_data = file_io.indexed_data(f"./datasets/{my_dir}/gene_table_taxon_assignment.csv")
        return jsonify(json_data)


@app.route('/api/v1/data/diamond', methods=['GET'])
@cross_origin()
def diamond_data():
    """
    Diamond date for a certain data point
    :return:
    """
    query_parameters = request.args

    my_id = query_parameters.get("id")
    fasta_id = query_parameters.get("fasta_id")
    my_id = int(my_id)
    my_dir = file_io.get_baseurl(int(my_id))

    json_data = file_io.taxonomic_hits_loader(fasta_id, f"./datasets/{my_dir}/taxonomic_hits.txt")

    # return as json
    return jsonify(json_data)


@app.route('/api/v1/data/seq', methods=['GET'])
@cross_origin()
def amino_acid_seq():
    """
    Amino acid sequence for a specific data point
    :return:
    """
    query_parameters = request.args

    my_id = query_parameters.get("id")
    fasta_id = query_parameters.get("fasta_id")

    # dataset directory
    my_id = int(my_id)
    my_dir = file_io.get_baseurl(int(my_id))

    seq = file_io.fast_fasta_loader(f"./datasets/{my_dir}/proteins.faa", fasta_id)

    # add newlines for formatting, this should be replaced by React code later
    every = 60
    seq = '\n'.join(seq[i:i + every] for i in range(0, len(seq), every))

    # return as json
    return jsonify(seq)

@app.route('/api/v1/data/summary', methods=['GET'])
@cross_origin()
def summary():
    """
    Amino acid sequence for a specific data point
    :return:
    """
    query_parameters = request.args
    my_id = query_parameters.get("id")
    # dataset directory
    my_id = int(my_id)
    my_dir = file_io.get_baseurl(int(my_id))

    data = file_io.load_summary(my_dir)

    # return as json
    return Response(data, mimetype="text")


@app.route('/api/v1/data/userconfig', methods=['GET', 'PUT'])
@cross_origin()
def get_config():
    """
    User config data
    :return:
    """
    query_parameters = request.args
    dataset_id = query_parameters.get("dataset_id")

    # get user settings
    if request.method == "GET":
        lock.acquire()
        data = file_io.load_user_config(dataset_id)
        lock.release()
        # return as json
        return data
    
    # set user settings
    elif request.method == "PUT":
        lock.acquire()
        settings = file_io.parse_user_config(dataset_id)
        # apply changes
        for key in request.json.keys():
            settings[key] = request.json[key]
        file_io.write_user_config(settings, dataset_id=dataset_id)
        lock.release()
        return "OK"


@app.route('/api/v1/data/pca_contribution', methods=['GET'])
@cross_origin()
def pca_contributions():
    """
    Amino acid sequence for a specific data point
    :return:
    """
    query_parameters = request.args

    my_id = query_parameters.get("id")
    # dataset directory
    my_id = int(my_id)
    my_dir = file_io.get_baseurl(int(my_id))

    data = file_io.load_pca_coords(my_dir)

    # return as json
    return jsonify(data)


@app.route("/download/fasta", methods=['POST'])
@cross_origin()
def download_fasta():
    """Download a .fasta of the user selection."""
    # genes to include
    genes = request.json['genes']
    sequences = []

    query_parameters = request.args
    my_id = query_parameters.get("id")
    my_dir = file_io.get_baseurl(my_id)

    # load requested sequences
    for gene in genes:
        sequences.append(">" + gene + '\n' + file_io.fast_fasta_loader(f"./datasets/{my_dir}/proteins.faa", gene))

    response_text = "\n".join(sequences)

    # API answer
    return Response(response_text, mimetype="text", headers={"Content-disposition": "attachment; filename=myplot.csv"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5500)
