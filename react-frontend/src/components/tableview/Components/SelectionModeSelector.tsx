import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { Row, Col } from 'react-bootstrap';
import { getFastaDownload } from '../../../api';

interface Props {
  passMode: Function
  selection: Set<string>
  dataset_id: number
  base_url: string
  main_data: any
}

/**
 * 
 * @param props passMode, selection
 * @returns 
 */
function SelectionModeSelector(props: Props) {
  const [mode, SetMode] = useState('neutral');

  // lift mode up
  useEffect(() => {
    props.passMode(mode)
  }, [mode])

  /**
   * Download the selected data in a specified files format
   * @param type file format
   */
  function download_file(type: string) {
    const my_body = {
      'genes': Array.from(props.selection).map((each: any) => {return props.main_data[each].fasta_header})
    }

    getFastaDownload(props.base_url, props.dataset_id, my_body)
    // create a temporary link & click to download blob as file
    .then((data) => {
      var a = document.createElement("a");
      a.href = window.URL.createObjectURL(data);
      a.download = "selection." + type;
      a.click();
    }); 
  }

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
              <Button variant="primary" className='btn-block' onClick={() => download_file("fasta")}>FASTA</Button>
              <Button variant="primary" className='btn-block' disabled={true}>CSV</Button>
              <Button variant="primary" className='btn-block' disabled={true}>JSON</Button>
            </ButtonGroup>
          </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SelectionModeSelector