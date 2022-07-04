import React from 'react'
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import InputGroup from 'react-bootstrap/InputGroup';
import Col from "react-bootstrap/esm/Col";
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import CustomOutput from './custom_output';
import { Modal } from 'react-bootstrap';
import MultiSelectFields from './MultiSelectFields'

interface SelectionData {
    row: {g_name: "Pick a gene", taxon_assignment: "Pick a gene", plot_label: "Pick a gene", best_hit: "Pick a gene", c_name: "Pick a gene", bh_evalue: 0, best_hitID: "?"};
    aa_seq: string;
}


/**
 * Customizable representation of table rows for a selected dot
 */
class SelectionView extends React.Component<any, any> {
  constructor(props: any){
		super(props);
    const options = [{ value:'One', selected:true }, { value: 'Two' }, { value:'Three' }]
    this.state = { custom_fields: [], show_field_modal: false, options: options}
	}

  /**
   * Fetch user configs on componenMount
   */
	componentDidMount() {
		const endpoint = "http://127.0.0.1:5000/api/v1/data/userconfig";
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
        // catch networking errors
        if (data === undefined) {
          data = []
        }
				this.setState( {custom_fields: data.custom_fields} )
			})
	}
  
  /**
   * Toogle modal open
   */
  showModal = () => {
    this.setState({ show_field_modal: true });
  };

  /**
   * Toggle modal closed
   */
  hideModal = () => {
    this.setState({ show_field_modal: false });
  };

  /**
   * Selection passed upwards
   * @param fields JSON
   */
  handleFieldsChange = (fields: any) => {
    this.setState({ custom_fields: fields})
  }

  render() {
    return(
      <Card className="m-2">
        <Card.Body>
          <Card.Title>
              Selected Gene
          </Card.Title>
          <Row>
            <Col className="md-2">
              <InputGroup className="m-2">
                <InputGroup.Text id="gene-info-name">Gene Name</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    contentEditable={false}
                    value={this.props.row.g_name}
                  />
              </InputGroup>
            </Col>
            <Col className="md-2">
              <InputGroup className="m-2">
                <InputGroup.Text id="gene-label">Label</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    contentEditable={false}
                    value={this.props.row.plot_label}
                    />
                </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col className="md-2" xs={8}>
              <InputGroup className="m-2">
                <InputGroup.Text id="best-hit">Best hit</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    contentEditable={false}
                    value={this.props.row.best_hit}
                  />
                </InputGroup>
            </Col>
            <Col className='md-2'>
              <InputGroup className="m-2">
                  <InputGroup.Text id="ncbi-id">ID</InputGroup.Text>
                    <Form.Control
                    placeholder="None"
                    contentEditable={false}
                    value={this.props.row.best_hitID}
                    />
                    <Button 
                    id="button.ncbi" 
                    href={'https://www.ncbi.nlm.nih.gov/taxonomy/?term=' + this.props.row.best_hitID.toString()}
                    target="_blank">
                      <span className="bi bi-box-arrow-up-right"></span>
                    </Button>
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col className="md-2">
                <InputGroup className="m-2">
                  <InputGroup.Text id="contig">Contig</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    contentEditable={false}
                    value={this.props.row.c_name}
                  />
                </InputGroup>
              </Col>
              <Col className="md-2">
                <InputGroup className="m-2">
                  <InputGroup.Text id="e-value">e-value</InputGroup.Text>
                    <Form.Control
                      placeholder="Selected a Gene to get started"
                      contentEditable={false}
                      value={this.props.row.bh_evalue}
                    />
                </InputGroup>
              </Col>
              <Col className='md-2' xs={3}> 
                <Button className='m-2' onClick={this.showModal}>
                  <span className='bi bi-list-ul m-2'/>More Fields
                </Button>
              </Col>
            </Row>
            <Modal show={this.state.show_field_modal} handleClose={this.hideModal}>
              <Modal.Header>
                <Modal.Title>Choose custom fields</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <MultiSelectFields
                onFieldsChange={this.handleFieldsChange}
                default_fields={this.state.custom_fields}/>  
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={this.hideModal}>Close</Button>
              </Modal.Footer>
            </Modal>
            <Row>
              { // Load custom fields from prop and render additional UI elements
              this.state.custom_fields.map((item: any) => (
                <CustomOutput col={item.value} row={this.props.row} name={item.label}/>
              ))}
            </Row>
            <Row>
              <Col className="m-2">
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Raw JSON</Accordion.Header>
                    <Accordion.Body>
                      <pre className='pre-scrollable'>
                        <code>
                          {JSON.stringify(this.props.row, null, 2)}
                        </code>
                      </pre>
                    </Accordion.Body>
                  </Accordion.Item>   
                </Accordion>
              </Col>
            </Row>
            <Row>
              <Col className="m-2">
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Amino Acid Sequence</Accordion.Header>
                    <Accordion.Body>
                      <div className='md-2'>
                      <pre className='pre-scrollable m-2'>
                        <code>
                          {this.props.aa_seq}
                        </code>
                      </pre>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>   
                </Accordion>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )
  }
}

export default SelectionView