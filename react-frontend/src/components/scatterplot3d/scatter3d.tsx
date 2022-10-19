import { Component } from 'react';
import Plot from 'react-plotly.js';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { Spinner } from "react-bootstrap";

const colors = require("./colors.json")

interface Props {
	dataset_id: any
	sendClick: any
	sendCameraData: any
	passScatterData: any
	e_value: any
	show_unassigned: boolean
	base_url: string
	g_searched: string[]
}

/**
 * Main Scatterplot Component
 */
class Scatter3D extends Component<Props, any> {
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
			color_palette: "rainbow", // currently selected color palette
			color_options: colors.options, // color palette options
			camera_ratios: {xy: 1.0, xz: 1.0, yz: 1.0},
			legendonly: [],
			last_click : "",
			figure: {data: [], layout: {}, frames: [], config: {}, scene: {}},
			is_loading: false,
		}
        this.sendClick = this.sendClick.bind(this);
	}

	/**
	 * Call API on component mount to load plot data
	 */
	componentDidMount() {
		const endpoint = `http://${this.props.base_url}:5500/api/v1/data/scatterplot?id=${this.props.dataset_id}`;
		this.setState({is_loading: true})
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {data: data}, () => {
					this.build_plot()
				});
				this.set_auto_size(data);
			})
			.finally( () => {
				this.setState({is_loading: false})
			})
	}

	/**
	 * Reload plot if dataset has changed
	 * @param prev previous state
	 */
	componentDidUpdate(prev: any) {
		if (prev.dataset_id !== this.props.dataset_id) {
			// loading spinner
			this.setState({is_loading: true})
			const endpoint = `http://${this.props.base_url}:5500/api/v1/data/scatterplot?id=${this.props.dataset_id}`;
			fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {data: data}, () => {
					// build_plot() consume state.data ==> await State update
					this.build_plot()
				});
				this.set_auto_size(data);
			})
			.finally( () => {
				this.setState({is_loading: false})
			})
		} else if (prev.e_value !== this.props.e_value || prev.show_unassigned !== this.props.show_unassigned || prev.g_searched !== this.props.g_searched){
			this.build_plot()
		}
	}

	/**
	 * Regulate component updates => plot updates
	 * @param nextProps new Props
	 * @param nextState new state
	 * @param nextContext new context
	 * @returns boolean
	 */
	 shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<any>, nextContext: any): boolean {
		// external changes
		if (nextProps.e_value !== this.props.e_value || nextProps.show_unassigned !== this.props.show_unassigned || nextProps.g_searched !== this.props.g_searched) {
			return true
		}
		// changes of the figure should always raise an update, otherwise user interaction is limited
		if (nextState.figure !== this.state.figure) {
			return true
		}
		// dataset changed
		if (nextProps.dataset_id !== this.props.dataset_id) {
			return true
		}

		

		return false
	}

	/**
	 * Pass camera data to parent to update PCA Plot
	 * @param e event data
	 */
	passCameraData(e: any) {
		if(e['scene.camera'] === undefined) {
			return
		}
		if(e['scene.camera'].up){
			// coordinate ratios
			const my_camera = e['scene.camera'].eye
			const xy = Math.round(my_camera.x / my_camera.y * 100) / 100
			const xz = Math.round(my_camera.x / my_camera.z * 100) / 100
			const yz = Math.round(my_camera.y / my_camera.z * 100) / 100

			const new_ratios = {xy: xy, xz: xz, yz: yz}
			const old_ratios = this.state.camera_ratios

			// If ratios have changed
			if (new_ratios.xy !== old_ratios.xy || new_ratios.xz !== old_ratios.xz || new_ratios.yz !== old_ratios.yz) {
				this.props.sendCameraData(e['scene.camera'])
				this.setState({camera_ratios: new_ratios})
			}
		}
    }

	/**
	 * A dot in the plot was clicked => pass to parent
	 * @param g_name gene name
	 */
	 sendClick(g_name: string){
		if (g_name !== this.state.last_click) {
			this.setState({last_click: g_name})
			this.props.sendClick([g_name]);
		}
    }

	/**
	 * Set colors
	 * @param key pallete's name 
	 */
	 set_color_palette(key: string){
		this.setState({color_palette: key}, () => {
			this.build_plot()
		})
		this.props.passScatterData({ colors: key, legendonly: this.state.legendonly})
	}

	/**
	 * Fire if the size slider was changed
	 * @param size value of the slider
	 */
	set_manual_size(size: number) {
		if (this.state.auto_size === false) {
			this.setState( { marker_size: size }, () => {
				this.build_plot()
			} )
		}
		this.setState( { manual_size: size} )
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
		if (this.state.auto_size === true) {
			// setting the marker size if auto sizing is enabled will update the plot
			// with appropriate markers after change of dataset
			this.setState( { auto_size_px: new_size, marker_size: new_size } )
		} else {
			this.setState( { auto_size_px: new_size } )
		}
	}

	/**
	 * Toggle automatic sizing of plot markers
	 */
	toggle_auto_size(e: any){
		// toggle
		const now = e.nativeEvent.originalTarget.checked
		// update markers if automatic sizing was enabled
		if (now === true) {
			this.setState( { marker_size: this.state.auto_size_px, auto_size: now}, () => {
				this.build_plot()
			})
		} else {
			this.setState({ marker_size: this.state.manual_size, auto_size: now}, () => {
				this.build_plot()
			})
		}
	}

	/**
	 * Track grouped de-/selection using the scatterplot legend
	 * This is tied to onRestyle to avoid desync with onClick() events
	 * @param e restyle event
	 */
	updateLegendSelection(e: any, ) {
		var plot: any = document.getElementById('scatter3d')
		const legendonly = plot.data.filter((trace: any) => trace.visible === "legendonly")
		if (legendonly !== this.state.legend_only) {
			this.setState({legendonly: legendonly})
			this.props.passScatterData({ colors: this.state.color_palette, legendonly: legendonly})
		}
		this.setState({ ui_revision: "false"})
	}

	/**
	 * Convert API data into plotly traces
	 * @param data API data
	 * @returns list of traces
	 */
	transformData (data: any[]) {
		const searched = this.props.g_searched
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
            const my_customdata : any = [];
            let chunk = each;

			// push 3D coordinates in arrays accordingly
		    chunk.map((each: { [x: string]: string; }) => {

				// filter by e-value
				if(parseFloat(each['bh_evalue']) < this.props.e_value) {
					x.push(each['Dim.1'])
					y.push(each['Dim.2'])
					z.push(each['Dim.3'])
					label = each['plot_label']
					my_customdata.push([each['plot_label'], each['g_name'], each['best_hit'], each['bh_evalue'], each['taxon_assignment'], each['c_name']])
				} 
				// Include unassigned data points (which usually don't have an e-value)
				else if(this.props.show_unassigned === true && each['plot_label'] === 'Unassigned') {
					x.push(each['Dim.1'])
					y.push(each['Dim.2'])
					z.push(each['Dim.3'])
					label = each['plot_label']
					my_customdata.push([each['plot_label'], each['g_name'], each['best_hit'], each['bh_evalue'], each['taxon_assignment'], each['c_name']])
				} else {
					//console.log(each['g_name'])
				}
		    })
			// Setup the plot trace
			let marker = {}
			if (searched.length > 0) {
				marker = {
					size: this.state.marker_size,
					opacity: 0.5,
					color: 'rgb(192,192,192)'
				}
			} else {
				marker = {
					size: this.state.marker_size
				}
			}

            const trace = {
                type: 'scatter3d',
                mode: 'markers',
                x: x,
                y: y,
                z: z,
                name: label,
                text: label,
				marker: marker,
				visible: true,
				customdata: my_customdata,
				hovertemplate: "%{customdata[0]} <br>%{customdata[1]} <br><extra>Best hit: %{customdata[2]} <br>Best hit e-value: %{customdata[3]} <br>Taxonomic assignment: %{customdata[4]} <br>Contig name: %{customdata[5]} <br> </extra>"
            }
            traces.push(trace)
        })

		// setup traces for selected / searched dots
		let searched_rows: any[] = []

		data.map(each => {
			const chunk = each
			chunk.map((each: any) => {
				if (searched.includes(each['g_name'])) {
					searched_rows.push(each)
				}
			})
		})
		const x : string[] = [];
		const y : string[] = [];
        const z : string[] = [];
        let label = "";
        const my_customdata : any = [];

		searched_rows.map(each => {

			// push 3D coordinates in arrays accordingly
			x.push(each['Dim.1'])
			y.push(each['Dim.2'])
			z.push(each['Dim.3'])
			label = "Search results"
			my_customdata.push([each['plot_label'], each['g_name'], each['best_hit'], each['bh_evalue'], each['taxon_assignment'], each['c_name']])
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
			marker: {
				size: this.state.marker_size,
				symbol: "diamond",
				color: 'rgb(255,102,0)'
			},
			visible: true,
			customdata: my_customdata,
			hovertemplate: "%{customdata[0]} <br>%{customdata[1]} <br><extra>Best hit: %{customdata[2]} <br>Best hit e-value: %{customdata[3]} <br>Taxonomic assignment: %{customdata[4]} <br>Contig name: %{customdata[5]} <br> </extra>"
		}
		traces.push(trace)
		return traces
	}

	/**
	 * Build the 3D scatterplot
	 * @returns Plotly Plot as React component
	 */
	 build_plot() {
		// store figure components
		const new_data = this.transformData(this.state.data)
		const new_layout = {autosize: true, showlegend: true, uirevision: 1,
			// @ts-ignore
			// overrides are incomplete here, ignore for now
			legend: {itemsizing: 'constant'},
			colorway : colors.palettes[this.state.color_palette]
		}
		const new_config = {scrollZoom: true}
		this.setState({figure: {data: new_data, layout: new_layout, config: new_config}})
	}

	/**
	 * Save the plot before rendering component 
	 * => impedes the plot from reseting on legend clicks
	 */
	legendClick(e: any) {
		var plot: any = document.getElementById('scatter3d')
		this.setState({figure: plot}, () => {
			this.build_plot()
		})
		return true
	}

	/**
	 * Render react component
	 * @returns render react component
	 */
	render() {
		return (
			<div>
				<div style={{ overflow: "auto" }}>
                	{this.state.is_loading  && <div className="text-center"><br></br><Spinner animation="border"></Spinner></div>}
				</div>
                <br></br>
				<Plot
				divId='scatter3d'
				data={this.state.figure.data}
				layout={this.state.figure.layout}
				config={this.state.figure.layout}
				onClick={(e: any) => this.sendClick(e.points[0].customdata[1])}
				onRelayout={(e: any) => this.passCameraData(e)}
				useResizeHandler = {true}
    			style = {{width: "100%", height: 800}}
				onRestyle={(e: any) => this.updateLegendSelection(e)}
				revision={1}
				onUpdate={(figure) => this.setState({figure: figure})}
				onLegendClick={(e) => this.legendClick(e)}
				/>
				<Row>
                    <Col xs={1}>
                        <Form>
                            <Form.Check 
                                type="switch"
                                id="custom-switch"
                                label="Auto-size"
								checked={this.state.auto_size}
								onChange={(e: any) => this.toggle_auto_size(e)}
                            />
                        </Form>
                    </Col>
                    <Col xs={5}>
						<InputGroup>
							<Form.Label>Dot size</Form.Label>
							<Form.Range 
								min={1} 
								max={10}
								step={1}
								defaultValue={5}
								onChange={(e :any) => this.set_manual_size(e.target.value)}
								className="m-2"
							/>
						</InputGroup>
                    </Col>
					<Col>
						<Form.Label>Color Palette</Form.Label>
						<Select
						defaultInputValue='Rainbow'
						defaultValue={"rainbow"}
						options={this.state.color_options}
						onChange={(e: any) => this.set_color_palette(e.value)}
						/>
					</Col>
                </Row>
			</div>
		)
	}
}

export default Scatter3D;