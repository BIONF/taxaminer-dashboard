import { Component } from 'react';
import Plot from 'react-plotly.js';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { InputGroup } from 'react-bootstrap';
import Select from 'react-select';

const colors = require("./colors.json")

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
			ui_revision: "true", // bound to plot to preserve camera position
			auto_size: true, // automatically size dots in scatterplot
			marker_size: 5, // actual dot size in the plot
			manual_size: 5, // dot size selected by user
			color_palette: "rainbow", // currently selected color palette
			color_options: colors.options // color palette options
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
				this.setState( {data: data} );
				this.set_auto_size(data);
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
		console.log(key)
		this.setState({color_palette: key})
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
                    onClick={(e: any) => this.handleTextChange(this.state.data[e.points[0].curveNumber][e.points[0].pointNumber])}
					useResizeHandler = {true}
    				style = {{width: "100%", height: 800}}
					onLegendClick={(e: any) => this.lock_uirevision()}
					
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