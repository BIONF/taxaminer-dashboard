import React from "react";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'

interface Props {
    sendValuesUp: any
}

// Filter Tab
class FilterUI extends React.Component<Props, any> {
    constructor(props: any){
		super(props);
		this.state ={
            e_value: 1.0,
            show_unassigned: true
        }
	}  

    /**
     * Update the stored filter information and send its values up
     */
    updateShowUnassigned(e: any) {
        this.setState({show_unassigned: e})
        const values = {'show_unassinged': e, 'e_value': this.state.e_value}
        this.props.sendValuesUp(values)
    }

    /**
     * Calculate the e-value from slider input and send it's value up
     * @param slider_value Value of UI slider
     */
    setEValue(slider_value: any) {
        console.log(this.state)
        const new_value = Math.E ** (-slider_value)
        this.setState({e_value: new_value})

        // pass values up
        const values = {'show_unassinged': this.state.show_unassigned, 'e_value': new_value}
        this.props.sendValuesUp(values)
    }

    render() {
        return (
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Filter</Card.Title>
                    <Form.Check 
                        type="switch"
                        id="show_unassigned"
                        label="Show unassinged"
                        defaultChecked={true}
                        onChange={(e) => this.updateShowUnassigned(e.target.checked)}
                    />
                    <Form.Label>e-value {"<"} {this.state.e_value}</Form.Label>
                    <Form.Range 
                        value={this.state.e_value_slider}
                        min={0}
                        max={300}
                        step={1}
                        defaultValue={0}
                        onChange={(e :any) => this.setEValue(e.target.value)}/>
                    <Form.Label>Contig Filter</Form.Label>
                    <Form.Select>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </Form.Select>
                </Card.Body>
            </Card>
        );
    } 
}

export { FilterUI }