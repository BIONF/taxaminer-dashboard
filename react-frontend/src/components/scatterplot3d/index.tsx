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
	c_searched: string[]
	scatterPoints: any[]
	filters: any
}

interface State {
	data: any[]
	traces: any[]
	selected_gene: string
	ui_revision: any
	auto_size: boolean
	marker_size: number
	manual_size: number
	color_palette: string
	color_options: any
	camera_ratios: {xy: number, xz: number, yz: number}
	legendonly: any[]
	figure: any
	is_loading: boolean
	show_hover: boolean
	revision: number
	g_search_len: number
	last_click: string
	auto_size_px: number
}

/**
 * Main Scatterplot Component
 */
class Scatter3D extends Component<Props, State> {
	constructor(props: any){
		super(props);
		this.state ={ 
			data: [] , // raw JSON data
			traces: [], // traces dicts for plotly
			selected_gene: "", // g_name
			ui_revision: "true", // bound to plot to preserve camera position
			auto_size: true, // automatically size dots in scatterplot
			marker_size: 5, // actual dot size in the plot
			manual_size: 5, // dot size selected by user
			color_palette: "rainbow", // currently selected color palette
			color_options: colors.options, // color palette options
			camera_ratios: {xy: 1.0, xz: 1.0, yz: 1.0},
			legendonly: [],
			figure: {data: [], layout: {}, frames: [], config: {}, scene: {}},
			is_loading: false,
			show_hover: true,
			revision: 1,
			g_search_len: 0,
			last_click: "",
			auto_size_px: 0
		}
        this.sendClick = this.sendClick.bind(this);
	}
	
	/**
	 * Reload plot if dataset has changed
	 * @param prev previous state
	 */
	componentDidUpdate(prev: any) {
		if (prev.scatterPoints !== this.props.scatterPoints) {
			const new_size = this.set_auto_size(this.props.scatterPoints);
			this.setState( { marker_size: new_size, auto_size: true})
			return this.build_plot()
		} else if (prev.e_value !== this.props.e_value || prev.show_unassigned !== this.props.show_unassigned || this.state.g_search_len !== this.props.g_searched.length || prev.c_searched !== this.props.c_searched){
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
		// New dataset
		if (nextProps.scatterPoints !== this.props.scatterPoints) {
			return true
		}
		// external changes
		if (nextProps.e_value !== this.props.e_value || nextProps.show_unassigned !== this.props.show_unassigned || nextProps.g_searched !== this.props.g_searched || nextProps.c_searched !== this.props.c_searched) {
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

		if (nextProps.g_searched.length !== this.state.g_search_len) {
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
		if (g_name !== this.state.last_click && g_name !== "PCA") {
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
	set_auto_size(data: any): number{
		if (data === undefined) {
			data = this.props.scatterPoints
		}
		let total_points = 0;
		// overall size of all trace arrays
		for (var trace of data) {
			total_points = total_points + trace.length
		}
		// this was chosen arbitrarily
		let new_size = 40 - Math.round(total_points / 15)
		// set a minimum size arbitrarily
		if (new_size < 3) {
			new_size = 3
		} else if(new_size > 10) {
			new_size = 10
		}
		if (this.state.auto_size === true) {
			// setting the marker size if auto sizing is enabled will update the plot
			// with appropriate markers after change of dataset
			this.setState( { auto_size_px: new_size, marker_size: new_size } )
		} else {
			this.setState( { auto_size_px: new_size } )
		}

		return new_size
	}

	/**
	 * Toggle automatic sizing of plot markers
	 */
	toggle_auto_size(e: any){
		// toggle
		const now = !this.state.auto_size
		// update markers if automatic sizing was enabled
		if (now === true) {
			this.setState( { marker_size: this.state.auto_size_px, auto_size: now}, () => {
				this.setState({ ui_revision: "false"})
				this.build_plot()
			})
		} else {
			this.setState({ marker_size: this.state.manual_size, auto_size: now}, () => {
				this.setState({ ui_revision: "false"})
				this.build_plot()
			})
		}
	}

	/**
	 * En-/Dis-able hover data overlay
	 * @param enabled true if enabled
	 */
	setHoverData(enabled: boolean) {
		this.setState({show_hover: !this.state.show_hover}, () => {
			this.build_plot()
		})
	}

	/**
	 * Track grouped de-/selection using the scatterplot legend
	 * This is tied to onRestyle to avoid desync with onClick() events
	 * @param e restyle event
	 */
	updateLegendSelection(e: any, ) {
		var plot: any = document.getElementById('scatter3d')
		const legendonly = plot.data.filter((trace: any) => trace.visible === "legendonly")
		if (legendonly !== this.state.legendonly) {
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
		const occurrences = {Unassigned: 0}
		// Avoid NoneType Exceptions
		if (data == null) {
			return []
		}

		// Hover enabled
		let hover_template = " "
		if (this.state.show_hover) {
			hover_template = "%{customdata[0]} <br>%{customdata[1]} <br><extra>Best hit: %{customdata[2]} <br>Best hit e-value: %{customdata[3]} <br>Taxonomic assignment: %{customdata[4]} <br>Contig name: %{customdata[5]} <br> </extra>"
		}
      
		const traces: any[] = []
       	for (const chunk of data) {
		    const x : string[] = [];
		    const y : string[] = [];
            const z : string[] = [];
            let label = "";
            const my_customdata : any = [];
			let visible = true

			/**
			 * Apply filters
			 */
		   	for (const each of chunk) {
				// contig filter prequisited
				let c_match = true
				if (this.props.c_searched) {
					if(this.props.c_searched.length > 0 && !this.props.c_searched.includes(each['c_name'])) {
						c_match = false
					}
				}

				// filter by e-value
				if(parseFloat(each['bh_evalue']) < this.props.e_value && c_match) {
					x.push(each['Dim.1'])
					y.push(each['Dim.2'])
					z.push(each['Dim.3'])
					label = each['plot_label']
					my_customdata.push([each['plot_label'], each['g_name'], each['best_hit'], each['bh_evalue'], each['taxon_assignment'], each['c_name']])
				} 
				// Include unassigned data points (which usually don't have an e-value)
				else if(each['plot_label'] === 'Unassigned' && c_match) {
					if (!this.props.show_unassigned) {
						visible = false
					}
					x.push(each['Dim.1'])
					y.push(each['Dim.2'])
					z.push(each['Dim.3'])
					label = each['plot_label']
					my_customdata.push([each['plot_label'], each['g_name'], each['best_hit'], each['bh_evalue'], each['taxon_assignment'], each['c_name']])
				} else {
					// nada
				}
				// increment counters
				if (occurrences[each['plot_label'] as keyof typeof occurrences] !== undefined) {
					occurrences[each['plot_label'] as keyof typeof occurrences] = occurrences[each['plot_label'] as keyof typeof occurrences] + 1
				} else {
					occurrences[each['plot_label'] as keyof typeof occurrences] = 1
				}
		    }

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

			// @ts-ignore
            const trace = {
                type: 'scatter3d',
                mode: 'markers',
				// legendgroup: "Genes",
                x: x,
                y: y,
                z: z,
				// @ts-ignore
                name: label + ` (${occurrences[label]})`,
				// @ts-ignore
                text: label,
				marker: marker,
				visible: visible,
				customdata: my_customdata,
				hovertemplate: hover_template,
            }
            traces.push(trace)
        }

		// setup traces for selected / searched dots
		let searched_rows: any[] = []
		for (const chunk of data) {
			for (const row of chunk) {
				if (searched.includes(row['g_name'])) {
					searched_rows.push(row)
				}
			}
		}

		const x : string[] = [];
		const y : string[] = [];
        const z : string[] = [];
        let label = "";
        const my_customdata : any = [];

		searched_rows.forEach(each => {
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
			// @ts-ignore
			name: label,
			text: label,
			marker: {
				size: this.state.marker_size,
				symbol: "diamond",
				color: 'rgb(255,102,0)'
			},
			visible: true,
			customdata: my_customdata,
			hovermode: this.state.show_hover,
			hovertemplate: hover_template
		}
		traces.push(trace)
		
		// @ts-ignore
		// Custom sort function, sort by number of occurences, decreasing
		traces.sort(function(a, b){return occurrences[b.text] - occurrences[a.text]})
		return traces
	}

	/**
	 * Build the 3D scatterplot
	 * @returns Plotly Plot as React component
	 */
	build_plot() {
		// store figure components
		const new_data = this.transformData(this.props.scatterPoints)
		const new_layout = {autosize: true, showlegend: true, uirevision: 1,
			// overrides are incomplete here, ignore for now
			legend: {
				itemsizing: 'constant', 
				tracegroupgap: 1,
			},
			colorway : colors.palettes[this.state.color_palette],	
		}
		const new_config = {scrollZoom: true}
		this.setState({figure: {data: new_data, layout: new_layout, config: new_config}, g_search_len: this.props.g_searched.length})
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
    			style = {{width: "100%", minHeight: 600}}
				onRestyle={(e: any) => this.updateLegendSelection(e)}
				revision={this.state.revision}
				onUpdate={(figure) => this.setState({figure: figure})}
				onLegendClick={(e) => this.legendClick(e)}
				/>
				<Row>
                    <Col xs={3}>
                        <Form>
                            <Form.Check 
                                type="switch"
                                id="custom-switch"
                                label="Auto-size dots"
								checked={this.state.auto_size}
								onChange={(e: any) => this.toggle_auto_size(e)}
                            />
							<Form.Check 
                                type="switch"
                                id="hoverdata-switch"
                                label="Verbose Hoverdata"
								checked={this.state.show_hover}
								onChange={(e: any) => this.setHoverData(e)}
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