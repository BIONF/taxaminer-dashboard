import React from 'react'
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import InputGroup from 'react-bootstrap/InputGroup';
import Col from "react-bootstrap/esm/Col";
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import CustomOutput from './custom_output';
import { Badge, Modal } from 'react-bootstrap';
import MultiSelectFields from './MultiSelectFields'

// dictionary
const fields_glossary: any[] = require("./field_options.json")

interface Props {
  base_url: string
  row: any
  aa_seq: string
}

interface State {
    custom_fields: any[]
    show_field_modal: boolean
    options: any[]
}

/**
 * Customizable representation of table rows for a selected dot
 */
class SelectionView extends React.Component<Props, State> {
  constructor(props: any){
		super(props);
    this.state = { custom_fields: [], show_field_modal: false, options: []}
	}

  /**
   * Fetch user configs on componenMount
   */
	componentDidMount() {
		const endpoint = `http://${this.props.base_url}:5500/api/v1/data/userconfig`;
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
   * 
   * @param prevProps previous Props
   * @param prevState previous State
   * @param snapshot Snapshot
   */
   componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
    if (prevProps.row != this.props.row) {
      this.convertFieldsOptions()
    }
  }


  /*
  * Update possible field options dynamically 
  */
  convertFieldsOptions() {
    let options: { label: string; value: string; }[] = []
    // available row features
    const row_keys = Object.keys(this.props.row)
    options = row_keys.map((each: string) => {
        // match against glossary
        for (const field of fields_glossary) {
            // exact match
            if (each === field.value) {
                return { label: (field.label), value: each }
            } else {
                // match with suffix (c_cov_...)
                const re = new RegExp(field.value + ".*");
                if (re.test(each)) {
                    return { label: (field.label + " (" + each + ")"), value: each }
                }
            }
        }
        return { label: each, value: each }
    })
    this.setState({options: options})
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
    // Hide modal
    this.setState({ show_field_modal: false });

    // Save user settings to API
    const request = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({ custom_fields: this.state.custom_fields })
    };

    fetch(`http://${this.props.base_url}:5500/api/v1/data/userconfig`, request)
    .then(response => console.log(response))
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
              Selected Gene { (this.props.row.plot_label === "Unassigned") && (<Badge bg="primary">Unassigned</Badge>)}
          </Card.Title>
          <Row>
            <Col className="md-2">
              <InputGroup className="m-2">
                <InputGroup.Text id="gene-info-name">Gene Name</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    contentEditable={false}
                    value={this.props.row.g_name}
                    onChange={() => false}
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
                    onChange={() => false}
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
                    onChange={() => false}
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
                    onChange={() => false}
                    />
                    <Button 
                    id="button.ncbi" 
                    href={'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=' + this.props.row.best_hitID.toString()}
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
                    onChange={() => false}
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
                      onChange={() => false}
                    />
                </InputGroup>
              </Col>
              <Col className='md-2' xs={3}> 
                <Button className='m-2' onClick={this.showModal}>
                  <span className='bi bi-list-ul m-2'/>Fields
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
                default_fields={this.state.custom_fields}
                options={this.state.options}/>  
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