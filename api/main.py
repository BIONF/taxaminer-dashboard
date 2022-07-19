import flask
import file_io
from flask import request, jsonify
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


@app.route('/api/v1/data/scatterplot', methods=['GET'])
@cross_origin()
def api_filter():
    """
    Filtered scatterplot data
    :return: requested data as JSON string
    """
    query_parameters = request.args

    my_id = query_parameters.get("id")

    json_data = file_io.convert_csv_to_json("./sample_data/gene_table_taxon_assignment.csv")

    # return as json
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

    json_data = file_io.taxonomic_hits_loader(fasta_id, "./sample_data/taxonomic_hits.txt")

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
    seq = file_io.fast_fasta_loader("./sample_data/proteins.faa", fasta_id)

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

    fasta_id = query_parameters.get("fasta_id")
    data = file_io.load_summary(dataset_id=my_id)

    # return as json
    return jsonify(data)


@app.route('/api/v1/data/userconfig', methods=['GET', 'PUT'])
@cross_origin()
def get_config():
    """
    User config data
    :return:
    """
    query_parameters = request.args

    # get user settings
    if request.method == "GET":
        data = file_io.load_user_config()
        # return as json
        return data
    
    # set user settings
    elif request.method == "PUT":
        settings = file_io.parse_user_config()
        # apply changes
        for key in request.json.keys():
            settings[key] = request.json[key]
        file_io.write_user_config(settings)
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

    data = file_io.load_pca_coords()

    # return as json
    return jsonify(data)


if __name__ == "__main__":
    app.run()
