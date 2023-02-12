import { Component } from 'react';
import Plot from 'react-plotly.js';
import { Card, Form, Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { FetchPCA } from '../../../api';

const variables = require("../../../static/tableRows.json")


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
	camera: any
	figure: any
}

/**
 * Main Scatterplot Component
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

	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
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

		if (prevProps.camera !== this.props.camera && this.state.sync_camera) {
			this.setState({camera: this.props.camera}, () => {
				this.setState({figure: this.build_plot()})
			})
		}

		if (prevState.arrows_on !== this.state.arrows_on) {
			this.setState({figure: this.build_plot()})
		}
	}

	setVar(var_id: string){
		for (const variable of variables) {
			const re = new RegExp(variable.value + ".*");
			if (variable.value === var_id || re.test(var_id)) {
				return this.setState({selected_var: var_id, selected_label: variable.label, selected_verbose: variable.tooltip})
			}
		}
		
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

		if (data.length !== 0) {
			for (const pca_point of data) {
				const pca_x : any[] = [];
				const pca_y : any[] = [];
				const pca_z : any[] = [];
				const pca_labels: string[] = []
				const real_pca_x: any[] = []
				const real_pca_y: any[] = []
				const real_pca_z: any[] = []
				// vector origin
				pca_x.push(0)
				pca_y.push(0)
				pca_z.push(0)
				pca_labels.push("origin")

				// vector tip
				pca_x.push(pca_point['x'][0])
				pca_y.push(pca_point['y'][0])
				pca_z.push(pca_point['z'][0])
				pca_labels.push(pca_point['label'])
				real_pca_x.push(pca_point['x'][0])
				real_pca_y.push(pca_point['y'][0])
				real_pca_z.push(pca_point['z'][0])

				// insert empty value to skip line to next origin
				pca_x.push(undefined)
				pca_y.push(undefined)
				pca_z.push(undefined)
				pca_labels.push("skip")

		
				// create plotly trace
				const pca_trace: any = {
					legendgroup: pca_point.label,
					type: 'scatter3d',
					mode: 'lines',
					width: 5,
					x: pca_x,
					y: pca_y,
					z: pca_z,
					name: pca_point.label,
					text: pca_labels,
					marker: {
						color: "Black"
					},
					customdata: [pca_point.label]
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
					x: real_pca_x.map(each => {return parseFloat(each) - parseFloat(each) * 0.01}),
					y: real_pca_y.map(each => {return parseFloat(each) - parseFloat(each) * 0.01}),
					z: real_pca_z.map(each => {return parseFloat(each) - parseFloat(each) * 0.01}),
					u: cone_x,
					v: cone_y,
					w: cone_z,
					anchor: "tip",
					// disable hoverdata and snapping
					hoverinfo: "skip",
					name: "Cones",
					// all black color gradient
					colorscale: [[0, "black"], [1, "black"]],
					showscale: false,
					sizemode: "absolute",
					// scale size based on shortest vector
					sizeref: 0.1,
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
						scene: {camera: this.state.camera},
						// @ts-ignore
						// overrides are incomplete here, ignore for now
						legend: {itemsizing: 'constant', tracegroupgap: 1, itemclick: false, itemdoubleclick: false},
						}}
					useResizeHandler = {true}
    				style = {{width: "100%", minHeight: 600}}
					//onLegendClick={(e: any) => this.lock_uirevision()}
					config={{scrollZoom: true}}
					className='mt-2'
					onClick={(e: any) => this.setVar(e.points[0].data.customdata[0])}
				/>
			)
	}

	toggleArrows = () => {
		this.setState({arrows_on: !this.state.arrows_on})
	}

	toggleSync = () => {
		this.setState({sync_camera: !this.state.sync_camera})
	}

	updateCamera = (camera: any) => {
		this.setState({camera: camera})
	}

	/**
	 * Render react component
	 * @returns render react component
	 */
	render() {
		return (
			<Row>
				<Col xs={8}>
					{this.state.figure}
				</Col>
				<Col>
					<Card className='mt-2'>
						<Card.Header>Variable Info</Card.Header>
						<Card.Body>
							<Card.Title>Selected: {this.state.selected_var}</Card.Title>
							<Card.Subtitle className="mb-2 text-muted">{this.state.selected_label}</Card.Subtitle>
							<Card.Text>{this.state.selected_verbose}</Card.Text>
						</Card.Body>
					</Card>
					<Card className='mt-2'>
						<Card.Header>
							Plot settings
						</Card.Header>
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
                        </Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		)
	}
}

export default PCAPlot;