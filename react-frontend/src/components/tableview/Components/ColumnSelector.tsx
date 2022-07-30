import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import Card from 'react-bootstrap/Card';
import { Row, Col } from 'react-bootstrap';

// possible options
const options = require("./main_cols.json")
const animatedComponents = makeAnimated();

/**
 * 
 * @param passMode bind function to pass mode up
 * @returns 
 */
function ColumnSelector(props: any) {
  const [mode, SetMode] = useState('neutral');

  function passCols(e: any) {
    let new_keys: string[] = []

    // extract col IDs
    e.forEach((element: any) => {
      new_keys.push(element.value)
    });
    props.passColsUp(new_keys)
  }

  return (
    <div>
      <Row className='mt-2'>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Select Columns</Card.Title>
              <Select 
              options={options} 
              components={animatedComponents} 
              isMulti defaultValue={options}
              onChange={(e: any) => passCols(e)}/>
            </Card.Body>
          </Card>
        </Col>
    </Row>
    </div>
  );
}

export default ColumnSelector