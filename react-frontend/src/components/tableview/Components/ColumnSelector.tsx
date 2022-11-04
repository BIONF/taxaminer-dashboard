import { Component, useState } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import Card from 'react-bootstrap/Card';
import { Row, Col } from 'react-bootstrap';

// possible options
const options = require("./main_cols.json")
const animatedComponents = makeAnimated();

interface Props {
	passCols: Function
	options: any[]
}

class ColumnSelector extends Component<Props, any> {

	render() {
		return (
			<div>
			<Row className='mt-2'>
				<Col>
					<Card>
						<Card.Body>
							<Card.Title>Select Columns</Card.Title>
							<Select 
							options={this.props.options} 
							components={animatedComponents} 
							isMulti defaultValue={options}
							onChange={(e: any) => this.props.passCols(e)}
							isClearable={false}/>
						</Card.Body>
					</Card>
				</Col>
		</Row>
		</div>
		)
	}
}

export default ColumnSelector