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
function ColumnSelector(passMode: any) {
  const [mode, SetMode] = useState('neutral');



  return (
    <div>
      <Row className='mt-2'>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Edit Mode</Card.Title>
              <Select 
              options={options} 
              components={animatedComponents} 
              isMulti defaultValue={options}/>
            </Card.Body>
          </Card>
        </Col>
    </Row>
    </div>
  );
}

export default ColumnSelector