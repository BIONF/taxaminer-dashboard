import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { Row, Col } from 'react-bootstrap';

/**
 * 
 * @param passMode bind function to pass mode up
 * @returns 
 */
function SelectionModeSelector(passMode: any) {
  const [mode, SetMode] = useState('neutral');

  // lift mode up
  useEffect(() => {
    passMode.passMode(mode)
  }, [mode])

  return (
    <div>
      <Row className='mt-2'>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Edit Mode</Card.Title>
              <ButtonGroup className='md-2' style={{width: "100%"}}>
                <Button variant="success" onClick={() => SetMode('add')} disabled={mode == 'add'} className='btn-block'>+</Button>
                <Button variant="secondary" onClick={() => SetMode('neutral')} disabled={mode == 'neutral' } className='btn-block'>o</Button>
                <Button variant="danger" onClick={() => SetMode('remove')} disabled={mode == 'remove'} className='btn-block'>-</Button>
              </ButtonGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
          <Card.Body>
            <Card.Title>Export data</Card.Title>
            <ButtonGroup className='md-2' style={{width: "100%"}}>
              <Button variant="primary" className='btn-block'>FASTA</Button>
              <Button variant="primary" className='btn-block'>CSV</Button>
              <Button variant="primary" className='btn-block'>JSON</Button>
            </ButtonGroup>
          </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SelectionModeSelector