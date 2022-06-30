import { Component } from 'react';
import Plot from 'react-plotly.js';

/**
 * Main Scatterplot Component
 */
class Scatter3D extends Component<any, any> {
	constructor(props: any){
		super(props);
		this.state ={ 
			data: [] , // raw JSON data
			traces: [], // traces dicts for plotly
			selected_gene: "", // g_name
			aa_seq: "", // inherited
			ui_revision: "true" // bound to plot to preserve camera position
		}
        this.handleTextChange = this.handleTextChange.bind(this);
	}

	/**
	 * Call API on component mount to load plot data
	 */
	componentDidMount() {
		const endpoint = "http://127.0.0.1:5000/api/v1/data/scatterplot?id=1";
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {data: data} )
			})
	}

	/**
	 * A dot in the plot was clicked => update current row, pass to parent
	 * @param e Plot OnClick() event
	 */
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

	/**
	 * This fixes a problem where clicking on the legend resets the camera.
	 * Manually updating the uirevision state blocks plot resets
	 * @returns True (as required by OnLegendClick() => )
	 */
	legend_lock_uirevision(){
		this.setState({ ui_revision: "true" })
		return(true)
	}

	/**
	 * Convert API data into plotly traces
	 * @param data API data
	 * @returns list of traces
	 */
	transformData (data: any[]) {

		// Avoid NoneType Exceptions
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

	/**
	 * Render react component
	 * @returns render react component
	 */
	render() {
		return (
			<div>
				<Plot
				divId='scatterplot'
					data = {this.transformData(this.state.data)}
					layout = {{autosize: true, showlegend: true, uirevision: this.state.ui_revision}}
                    onClick={(e: any) => this.handleTextChange(this.state.data[e.points[0].curveNumber][e.points[0].pointNumber])}
					useResizeHandler = {true}
    				style = {{width: "100%", height: 800}}
					onLegendClick={(e: any) => this.legend_lock_uirevision()}

				 />
			</div>
		)
	}
}

export default Scatter3D;