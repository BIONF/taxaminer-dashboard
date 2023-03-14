import chroma from 'chroma-js';
import { Component } from 'react';
import Plot from 'react-plotly.js';
const colors = require("./colors.json");

interface Props {
	sendClick: Function
	e_value: number
	show_unassigned: boolean
    scatter_data: any
	base_url: string
	dataset_id: number
	scatterPoints: any[]
	g_searched: string[]
	c_searched: string[]
}

/**
 * Main Scatterplot Component
 */
class ScatterMatrix extends Component<Props, any> {
	constructor(props: any){
		super(props);
		this.state ={ 
			data: [] , // raw JSON data
			traces: [], // traces dicts for plotly
			selected_gene: "", // g_name
			aa_seq: "", // inherited
			ui_revision: "true", // bound to plot to preserve camera position
			auto_size: true, // automatically size dots in scatterplot
			marker_size: 5, // actual dot size in the plot
			manual_size: 5, // dot size selected by user
			color_options: colors.options, // color palette options
			camera_ratios: {xy: 1.0, xz: 1.0, yz: 1.0},
			my_plot: undefined
		}
        this.sendClick = this.sendClick.bind(this);
	}

	/**
	 * Act on Prop updates (=> mainly: load a different dataset)
	 * @param prevProps previous props
	 * @param prevState previous state
	 * @param snapshot previous snapshot
	 */
	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
		// fetch the new dataset if the ID has changed
		if (prevProps.scatterPoints !== this.props.scatterPoints) {
			this.set_auto_size(this.props.scatterPoints);
			this.setState({data: this.props.scatterPoints}, () => {
				this.setState( { marker_size: this.state.auto_size_px, auto_size: true})
				this.setState({my_plot: this.build_plot()})
			})
			
		} else if (prevProps.scatter_data !== this.props.scatter_data){
			this.setState({my_plot: this.build_plot()})
		} else if (prevProps.c_searched !== this.props.c_searched || prevProps.show_unassigned !== this.props.show_unassigned) {
			this.setState({my_plot: this.build_plot()})
		}
	}

	/**
	 * A dot in the plot was clicked => pass to parent
	 * @param e Plot OnClick() event
	 */
    sendClick(e: any){
		this.props.sendClick(e.g_name);
    }

	/**
	 * This fixes a problem where some interactions reset the camera.
	 * Manually updating the uirevision state blocks plot resets
	 * @returns True (as required by OnLegendClick() => )
	 */
	lock_uirevision(){
		this.setState({ ui_revision: "true" })
		return(true)
	}

	/**
	 * Set automatic marker size
	 */
	set_auto_size(data: any){
		if (data === undefined) {
			data = this.state.data
		}
		let total_points = 0;
		// overall size of all trace arrays
		for (var trace of data) {
			total_points = total_points + trace.length
		}
		// this was chosen arbitrarily
		let new_size = 65 - Math.round(total_points / 10)
		// set a minimum size arbitrarily
		if (new_size < 3) {
			new_size = 3
		}
		this.setState( { marker_size: new_size } )
	}


	/**
	 * 
	 * @returns Set scatterplot axis
	 */
    set_axis() {
        return(
            {
                showline:false,
                zeroline:false,
                gridcolor:'#ffff',
                ticklen:2,
                tickfont:{size:10},
                titlefont:{size:12}
              }
        )
    }


	/**
	 * Convert API data into plotly traces
	 * @param data API data
	 * @returns list of traces
	 */
	transformData (data: any[], legendonly: any[]) {
		let legendonly_names: string[] = []
		const occurrences = {Unassigned: 0}

		legendonly.forEach((dot: any) => {
			legendonly_names.push(dot.text)
		})

		// Avoid NoneType Exceptions
		if (data == null) {
			return []
		}

        let traces: any[] = []
        traces = data.map(each => {
		    const x : string[] = [];
		    const y : string[] = [];
            const z : string[] = [];
            let label = "";
            const gene_names : string[] = [];
            let chunk = each;

			// push 3D coordinates in arrays accordingly
		    for(const each of chunk) {
				// filter by contigs
				if (this.props.c_searched !== undefined) {
					if (this.props.c_searched.length !== 0 && !this.props.c_searched.includes(each['c_name'])) {
						continue
					}
				}

				// exclude unassigned
				if (!this.props.show_unassigned && each['plot_label'] === "Unassigned"){
					continue
				}
				
                // filter by e-value
				if(parseFloat(each['bh_evalue']) < this.props.e_value) {
					x.push(each['Dim.1'])
					y.push(each['Dim.2'])
					z.push(each['Dim.3'])
					label = each['plot_label']
					gene_names.push(each['g_name'])
				} 
				// Include unassigned data points (which usually don't have a e-value)
				else if(this.props.show_unassigned === true && each['plot_label'] === 'Unassigned') {
					x.push(each['Dim.1'])
					y.push(each['Dim.2'])
					z.push(each['Dim.3'])
					label = each['plot_label']
					gene_names.push(each['g_name'])
				} else {
					//console.log(each['g_name'])
				}
				// increment counters
				if (occurrences[each['plot_label'] as keyof typeof occurrences] !== undefined) {
					occurrences[each['plot_label'] as keyof typeof occurrences] = occurrences[each['plot_label'] as keyof typeof occurrences] + 1
				} else {
					occurrences[each['plot_label'] as keyof typeof occurrences] = 1
				}
		    }

			// Setup the plot trace
			let visible = undefined
			if (legendonly_names.includes(label)) {
				visible = "legendonly"
			} else {
				visible = true
			}

			// plotly trace
            const trace = {
                type: 'splom',
                dimensions: [
                    {label: "Dim.1", values: x},
                    {label: "Dim.2", values: y},
                    {label: "Dim.3", values: z},
                ],
                name: label,
                text: label,
				visible: visible,
				marker: {
					size: this.props.scatter_data.marker_size,
					opacity: this.props.scatter_data.opacity
				},

				// track the unique gene name
				customdata: gene_names
            }
			return trace
        })
		traces.sort(function(a, b){return occurrences[b.text as keyof typeof occurrences] - occurrences[a.text as keyof typeof occurrences]})

		const my_scale = chroma.scale('Spectral');
		if (this.props.scatter_data.colors === "spectrum") {
			for (let i =0; i < traces.length; i++) {
				if (traces[i].name === "Search results") {
					continue
				}
				// @ts-ignore
				traces[i]['marker']['color'] = my_scale(i/traces.length).saturate(3).hex()
			}
		}
		return traces
	}

	/**
	 * Handle Selection events
	 * @param points plotly points
	 */
	handleSelection(points: any) {
		let selected_ids: string[] = []
		for (const point of points) {
			selected_ids.push(point.customdata)
		}
		// pass data up
		this.props.sendClick(selected_ids)
	}

	/**
	 * Build the 3D scatterplot
	 * @returns Plotly Plot as React component
	 */
	build_plot() {
		return (
			<Plot
				divId='scattermatrix'
					data = {this.transformData(this.state.data, this.props.scatter_data.legendonly)}
					layout = {{
						autosize: true,
						showlegend: true,
						uirevision: this.state.ui_revision,
						// @ts-ignore
						// overrides are incomplete here, ignore for now
						legend: {itemsizing: 'constant', orientation: "h", y: -0.25,
						// @ts-ignore
                        xaxis:this.set_axis(),
                        yaxis:this.set_axis(),
                        xaxis2:this.set_axis(),
                        xaxis3:this.set_axis(),
                        yaxis2:this.set_axis(),
                        yaxis3:this.set_axis(),
                        yaxis4:this.set_axis()},
						colorway : colors.palettes[this.props.scatter_data.colors]
						}}
                    style = {{width: "95%", height: "100%", minHeight: 600}}

					// disable legend trace selection (=> slave to main plot)
					onLegendClick={() => false}
					onLegendDoubleClick={() => false}
					onSelected={(e:any) => this.handleSelection(e.points)}
				/>
		)
	}

	/**
	 * Render react component
	 * @returns render react component
	 */
	render() {
		return (
			<div>
				{this.state.my_plot}
			</div>
		)
	}
}

export default ScatterMatrix;