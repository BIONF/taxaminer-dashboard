import { Component } from 'react';
import Plot from 'react-plotly.js';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { InputGroup } from 'react-bootstrap';
import Select from 'react-select';

const colors = require("./colors.json")

interface Props {
	dataset_id: any
	sendClick: any
	sendCameraData: any
	passScatterData: any
	e_value: any
	show_unassigned: boolean
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
			camera_ratios: {xy: 1.0, xz: 1.0, yz: 1.0}
		}
        this.sendClick = this.sendClick.bind(this);
	}

	/**
	 * Call API on component mount to load plot data
	 */
	componentDidMount() {
		const endpoint = `http://127.0.0.1:5000/api/v1/data/scatterplot?id=${this.props.dataset_id}`;
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {data: data} );
				this.set_auto_size(data);
			})
	}

	/**
	 * Reload plot if dataset has changed
	 * @param prev previous state
	 */
	componentDidUpdate(prev: any) {
		if (prev.dataset_id != this.props.dataset_id) {
			const endpoint = `http://127.0.0.1:5000/api/v1/data/scatterplot?id=${this.props.dataset_id}`;
			fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {data: data} );
				this.set_auto_size(data);
			})
		}
	}

	/**
	 * Pass camera data to parent to update PCA Plot
	 * @param e event data
	 */
	passCameraData(e: any) {
		if(e['scene.camera'] == undefined) {
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

	set_color_palette(key: string){
		var locked = this.lock_uirevision()
		this.setState({color_palette: key})
		this.props.passScatterData({ colors: key})
	}

	/**
	 * Fire if the size slider was changed
	 * @param size value of the slider
	 */
	set_manual_size(size: number) {
		if (this.state.auto_size === false) {
			this.setState( { marker_size: size, manual_size: size} )
		} else {
			this.setState( { manual_size: size} )
		}
	}

	/**
	 * Set automatic marker size
	 */
	set_auto_size(data: any){
		if (data == undefined) {
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
	 * Toggle automatic sizing of plot markers
	 */
	toggle_auto_size(){
		// toggle
		this.setState({ auto_size: !this.state.auto_size })
		// update markers if automatic sizing was enabled
		if (this.state.auto_size == false) {
			this.set_auto_size(undefined)
		} else {
			this.setState( { marker_size: this.state.manual_size} )
		}
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
					size: this.state.marker_size
				}
            }
            traces.push(trace)
        })
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
						uirevision: this.state.ui_revision,
						// @ts-ignore
						// overrides are incomplete here, ignore for now
						legend: {itemsizing: 'constant'},
						colorway : colors.palettes[this.state.color_palette]
						}}
                    onClick={(e: any) => this.sendClick(this.state.data[e.points[0].curveNumber][e.points[0].pointNumber])}
					onRelayout={(e: any) => this.passCameraData(e)}
					useResizeHandler = {true}
    				style = {{width: "100%", height: 800}}
					onLegendClick={(e: any) => this.lock_uirevision()}
					config={{scrollZoom: true}}
					
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
				{this.build_plot()}
				<Row>
                    <Col xs={1}>
                        <Form>
                            <Form.Check 
                                type="switch"
                                id="custom-switch"
                                label="Auto-size"
								checked={this.state.auto_size}
								onChange={(e: any) => this.toggle_auto_size()}
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