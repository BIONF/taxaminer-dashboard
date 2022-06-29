import React, { Component } from 'react';
import Plot from 'react-plotly.js';

// Main Scatterplot component
class Scatter3D extends Component<any, any> {
	constructor(props: any){
		super(props);
		this.state ={ data: [] , traces: [], selected_gene: "", aa_seq: ""}
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
	}

	// Call API upon component mount
	componentDidMount() {
		const endpoint = "http://127.0.0.1:5000/api/v1/data/scatterplot?id=1";
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {data: data} )
			})
	}

    handleSelectionChange(e: string) {
        this.props.onSelectionChange(e)
    }

    handleTextChange(e: any){

		// fetch the corresponding aa sequence and pass it up
		const endpoint = "http://127.0.0.1:5000/api/v1/data/seq?fasta_id=" + e.g_name;
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {aa_seq: data} )
				this.props.handleTextChange(e, data);
			})
    }

	// Change data structure
	transformData (data: any[]) {
		if (data == null) {
			return []
		}

        const traces: any[] = []
        data.map(each => {
		    const x : string[] = [];
		    const y : string[] = [];
            const z : string[] = [];
            let label = "";
            const gene_names : string[] = [];
            let chunk = each;

			// push 3D coordinates in arrays accordingly
		    chunk.map((each: { [x: string]: string; }) => {
			    x.push(each['Dim.1'])
			    y.push(each['Dim.2'])
                z.push(each['Dim.3'])
                label = each['plot_label']
                gene_names.push(each['g_name'])
		    })

			// Setup the plot trace
            const trace = {
                type: 'scatter3d',
                mode: 'markers',
                x: x,
                y: y,
                z: z,
                name: label,
                text: label,
            }
            traces.push(trace)
        })
		return traces
	}

	render() {
		return (
			<div>
				<Plot
					data = {this.transformData(this.state.data)}
					layout = {{autosize: true, showlegend: true, uirevision: 'true'}}
                    onClick={(e: any) => this.handleTextChange(this.state.data[e.points[0].curveNumber][e.points[0].pointNumber])}

					useResizeHandler = {true}
    				style = {{width: "100%", height: 800}}

				 />
			</div>
		)
	}
}

export default Scatter3D;