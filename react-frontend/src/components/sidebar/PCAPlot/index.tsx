import React from 'react';
import { Component } from 'react';
import Plot from 'react-plotly.js';
import { Card, Form, Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { FetchPCA } from '../../../api';
import chroma from "chroma-js";

import variables from "../../../static/tableRows.json";


interface Props {
	base_url: string
	dataset_id: number
	camera: any
}

interface State {
	data: any[]
	traces: any[]
	selected_gene: string
	ui_revision: string
	selected_var: string
	selected_label: string
	selected_verbose: string
	arrows_on: boolean
	sync_camera: boolean
	color_mode: boolean
	hover_verbosity: boolean
	camera: any
	figure: any
}

/**
 * PCA info plot components
 */
class PCAPlot extends Component<Props, State> {
	constructor(props: any){
		super(props);
		this.state ={ 
			data: [] , // raw JSON data
			traces: [], // traces dicts for plotly
			selected_gene: "", // g_name
			ui_revision: "true", // bound to plot to preserve camera position
			selected_var: "None",
			selected_label: "None",
			selected_verbose: "Click a point in the plot to get started",
			arrows_on: true,
			sync_camera: true,
			color_mode: true,
			hover_verbosity: true,
			camera: this.props.camera,
			figure: ""
		}
	}

	/**
	 * Call API on component mount to load plot data
	 */
	componentDidMount() {
		if (this.props.dataset_id !== -1) {
			FetchPCA(this.props.base_url, this.props.dataset_id)
			.then(data => {
					this.setState( {data: data} );
					this.setState({figure: this.build_plot()})
			})
		}
		
	}


	/**
	 * React call on component update
	 * @param prevProps previous Props
	 * @param prevState previous State
	 */
	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>): void {
		// Load new PCA data, if dataset has changed
		if (prevProps.dataset_id !== this.props.dataset_id) {
			if (this.props.dataset_id !== -1) {
				FetchPCA(this.props.base_url, this.props.dataset_id)
				.then(data => {
					this.setState( {data: data}, () => {
						this.setState({figure: this.build_plot()})
					} );
				})
			}
		}

		// sync to main scatterplot
		if (prevProps.camera !== this.props.camera && this.state.sync_camera) {
			this.setState({camera: this.props.camera}, () => {
				this.setState({figure: this.build_plot()})
			})
		}

		if (prevState.arrows_on !== this.state.arrows_on) {
			this.setState({figure: this.build_plot()})
		}

		if (prevState.color_mode !== this.state.color_mode) {
			this.setState({figure: this.build_plot()})
		}

		if (prevState.hover_verbosity !== this.state.hover_verbosity) {
			this.setState({figure: this.build_plot()})
		}
	}

	/**
	 * Set the currently selected variable from all PCA vars
	 * @param var_id name of variable
	 * @returns 
	 */
	setVar(var_id: string): void{
		for (const variable of variables) {
			const re = new RegExp("^" + variable.value + "_.*");
			if (variable.value === var_id || re.test(var_id)) {
				// @ts-ignore
				return this.setState({selected_var: var_id, selected_label: variable.label, selected_verbose: variable.tooltip})
			}
		}
		
	}

	/**
	 * Get variable label and tooltip from variable ID
	 * @param var_id name of variable
	 * @returns 
	 */
	getVar(var_id: string): { label: string; tooltip: string } | undefined {
		for (const variable of variables) {
			if (variable.value === var_id) {
				return { label: variable.label, tooltip: variable.tooltip}
			} else {
				const re = new RegExp("^" + variable.value + "_.*");
				if (re.test(var_id)) {
					return { label: variable.label + " " + var_id.split('_').splice(-1)[0], tooltip: variable.tooltip}
				}
			}
		}
		return undefined;
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

		// holds all plot traces
		const traces: any[] = []

		let my_scale = chroma.scale('Spectral').colors(data.length).map(c => chroma(c).saturate(3).hex());
		if (this.state.color_mode == false) {
			my_scale = chroma.scale(['#ccccccff','#000000']).colors(data.length);
		}


		if (data.length !== 0) {
			for (let i = 0; i < data.length; i ++) {
				const pca_point = data[i]
				const pca_x : any[] = [];
				const pca_y : any[] = [];
				const pca_z : any[] = [];
				const pca_labels: string[] = []
				const real_pca_x: any[] = []
				const real_pca_y: any[] = []
				const real_pca_z: any[] = []
				const pca_var = this.getVar(pca_point.label)
				// vector origin
				pca_x.push(0)
				pca_y.push(0)
				pca_z.push(0)
				pca_labels.push("origin")

				// vector tip
				pca_x.push(pca_point['x'][0])
				pca_y.push(pca_point['y'][0])
				pca_z.push(pca_point['z'][0])
				pca_labels.push(pca_var.label)
				real_pca_x.push(pca_point['x'][0])
				real_pca_y.push(pca_point['y'][0])
				real_pca_z.push(pca_point['z'][0])

				// insert empty value to skip line to next origin
				pca_x.push(undefined)
				pca_y.push(undefined)
				pca_z.push(undefined)
				pca_labels.push("skip")

				let my_hovertemplate = pca_var.label + "<br>(PC1: %{x:.3f}, PC2: %{y:.3f}, PC3: %{z:.3f})<br>" + pca_point.label + "<extra></extra>"
				if (this.state.hover_verbosity == false) {
					my_hovertemplate = pca_var.label + "<extra></extra>";	
				}


				// create plotly trace
				const pca_trace: any = {
					legendgroup: pca_var.label,
					type: 'scatter3d',
					mode: 'lines',
					width: 5,
					x: pca_x,
					y: pca_y,
					z: pca_z,
					name: pca_var.label,
					text: pca_labels,
					marker: {
						color: my_scale[i]
					},
					customdata: [pca_point.label],
					hovertemplate: my_hovertemplate,
					hoverinfo: "all"
				}

				// scale cones based on max val
				const cone_x = real_pca_x.map(each => {
					return parseFloat(each) * 0.5
				})
				const cone_y = real_pca_y.map(each => {
					return parseFloat(each) * 0.5
				})
				const cone_z = real_pca_z.map(each => {
					return parseFloat(each) * 0.5
				})

				// add cones to the tips of the PCA trace to form arrows
				const pca_cones = {
					legendgroup: pca_point.label,
					type: "cone",
					// shorten the cones such that the mouse hover hits the PCA trace
					x: real_pca_x.map(each => {return parseFloat(each) - parseFloat(each) * 0.0075}),
					y: real_pca_y.map(each => {return parseFloat(each) - parseFloat(each) * 0.0075}),
					z: real_pca_z.map(each => {return parseFloat(each) - parseFloat(each) * 0.0075}),
					u: cone_x,
					v: cone_y,
					w: cone_z,
					anchor: "tip",
					// disable hoverdata and snapping
					hoverinfo: "skip",
					name: "Cones",
					// all black color gradient
					colorscale: [[0, my_scale[i]], [1, my_scale[i]]],
					showscale: false,
					sizemode: "absolute",
					// scale size based on shortest vector
					sizeref: 0.075,
					customdata: [pca_point.label]
				}
				traces.push(pca_trace)
				if (this.state.arrows_on) {
					traces.push(pca_cones)
				}
			}

		}
		return traces
	}

	/**
	 * Build the 3D scatterplot
	 * @returns Plotly Plot as React component
	 */
	build_plot() {
		return (
				<Plot
					divId='scatterplot'
					data = {this.transformData(this.state.data)}
					layout = {{
						autosize: true,
						showlegend: true,
						uirevision: "true",
						margin: {l: 0, r: 0, b: 0, t: 25},
						scene: {
							camera: this.state.camera,
							xaxis: {color: "grey", gridcolor: "lightgrey", title: {text: 'PC 1'}},
							yaxis: {color: "grey", gridcolor: "lightgrey", title: {text: 'PC 2'}},
							zaxis: {color: "grey", gridcolor: "lightgrey", title: {text: 'PC 3'}},
							grid: {color: "grey", gridcolor: "lightgrey"},
						},
						// @ts-ignore
						// overrides are incomplete here, ignore for now
						legend: {itemsizing: 'constant', tracegroupgap: 1, itemclick: false, itemdoubleclick: false, orientation: "v"},
						}}
					useResizeHandler = {true}
					style = {{width: "100%", height: "auto"}} 
					config={{scrollZoom: true}}
					className='mt-2'
					onClick={(e: any) => this.setVar(e.points[0].data.customdata[0])}
				/>
			)
	}

	/**
	 * Toogle arrow tips visibility
	 */
	toggleArrows = () => {
		this.setState({arrows_on: !this.state.arrows_on})
	}

	/**
	 * Toggle camera sync
	 */
	toggleSync = () => {
		this.setState({sync_camera: !this.state.sync_camera})
	}

	/**
	 * Toggle color 
	 */
	toggleColor = () => {
		this.setState({color_mode: !this.state.color_mode})
	}

	toggleHoverVerbosity = () => {
		this.setState({hover_verbosity: !this.state.hover_verbosity})
	}

	/**
	 * Update current camera settings
	 * @param camera plotly camera
	 */
	updateCamera = (camera: any) => {
		this.setState({camera: camera})
	}

	/**
	 * Render react component
	 * @returns render react component
	 */
	render() {
		return (
			<>
				<Row className="mt-2">
					<Col md={12}>
						<Card>
							<Card.Body>
								<Card.Title>Contribution of variables</Card.Title>
								{this.state.figure}
							</Card.Body>
						</Card>
					</Col>
					
				</Row>
				<Row className="mt-2">
					<Col md={6}>
						<Card>
							<Card.Header>Variable Info</Card.Header>
							<Card.Body>
								<Card.Title>Selected: {this.state.selected_label}</Card.Title>
								<Card.Subtitle className="mb-2 text-muted">{this.state.selected_var}</Card.Subtitle>
								<Card.Text>{this.state.selected_verbose}</Card.Text>
							</Card.Body>
						</Card>
					</Col>
					<Col md={6}>
						<Card>
							<Card.Header>Plot settings</Card.Header>
							<Card.Body>
							<Form>
								<Form.Check 
									type="switch"
									id="custom-switch"
									label="Sync perspective to scatterplot"
									checked={this.state.sync_camera}
									onChange={() => this.toggleSync()}
								/>
								<Form.Check 
									type="switch"
									id="hoverdata-switch"
									label="Arrows"
									checked={this.state.arrows_on}
									onChange={() => this.toggleArrows()}
								/>
								<Form.Check 
									type="switch"
									id="color-switch"
									label="Color"
									checked={this.state.color_mode}
									onChange={() => this.toggleColor()}
								/>
								<Form.Check 
									type="switch"
									id="hover-switch"
									label="Verbose hover"
									checked={this.state.hover_verbosity}
									onChange={() => this.toggleHoverVerbosity()}
								/>
							</Form>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</>
		)
	}
}

export default PCAPlot;