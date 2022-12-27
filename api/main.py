import os
import shutil
import zipfile
import flask
import file_io
from flask import request, jsonify, send_file, abort
from flask.wrappers import Response
from flask_cors import CORS, cross_origin

# flask server
app = flask.Flask(__name__)

# absence of CORS headers might interfere with the webkit server
cors = CORS(app)
app.config["DEBUG"] = True
app.config['CORS_HEADERS'] = 'Content-Type'


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
    keep_zip = bool(int(request.form['keep_zip']))

    temp_path = "./temp/" + file_name + ".zip"

    # jump to the flask working dir and save with predefined filename
    my_file.save(temp_path)

    # unzip
    with zipfile.ZipFile(temp_path, 'r') as zip_ref:
        zip_ref.extractall("./temp/" + file_name + "/")
    
    # copy to dataset folder
    try:
        os.renames(f"./temp/{file_name}/taxonomic_hits.txt", f"./datasets/{file_name}/taxonomic_hits.txt")
        os.renames(f"./temp/{file_name}/proteins.faa", f"./datasets/{file_name}/proteins.faa")
        os.renames(f"./temp/{file_name}/taxonomic_assignment/gene_table_taxon_assignment.csv", f"./datasets/{file_name}/gene_table_taxon_assignment.csv")
        os.renames(f"./temp/{file_name}/gene_info/summary.txt", f"./datasets/{file_name}/summary.txt")
        os.renames(f"./temp/{file_name}/PCA_and_clustering/PCA_results/pca_loadings.csv", f"./datasets/{file_name}/pca_loadings.csv")

        if keep_zip:
            os.renames(f"./temp/{file_name}.zip", f"./datasets/{file_name}/{file_name}.zip")
        else:
            os.remove(f"./temp/{file_name}.zip")

        # clean up
        shutil.rmtree("./temp/" + file_name + "/")

    except FileNotFoundError:
        print("Invalid file uploaded")
        return abort(500)

    # return as json
    return "Finished"

@app.route('/api/v1/data/remove', methods=['GET'])
@cross_origin()
def remove_datasets():
    query_parameters = request.args
    my_id = query_parameters.get("id")
    my_dir = file_io.get_baseurl(my_id)

    shutil.rmtree("./datasets/" + my_dir)

    # return as json
    return "Success"


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
    every = 40
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
    print(query_parameters)
    dataset_id = query_parameters.get("dataset_id")

    # get user settings
    if request.method == "GET":
        data = file_io.load_user_config(dataset_id)
        # return as json
        return data
    
    # set user settings
    elif request.method == "PUT":
        settings = file_io.parse_user_config(dataset_id)
        # apply changes
        for key in request.json.keys():
            settings[key] = request.json[key]
        file_io.write_user_config(settings, dataset_id=dataset_id)
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

    # load requested sequences
    for gene in genes:
        sequences.append(">" + gene + '\n' + file_io.fast_fasta_loader(f"./datasets/{my_id}/proteins.faa", gene))

    response_text = "\n".join(sequences)

    # API answer
    return Response(response_text, mimetype="text", headers={"Content-disposition": "attachment; filename=myplot.csv"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5500)
