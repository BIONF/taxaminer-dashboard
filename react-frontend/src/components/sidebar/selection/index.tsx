import React from 'react'
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import InputGroup from 'react-bootstrap/InputGroup';
import Col from "react-bootstrap/esm/Col";
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import CustomOutput from './custom_output';
import { Alert, Badge, Modal, OverlayTrigger, Placeholder, Tab, Tabs, Tooltip } from 'react-bootstrap';
import MultiSelectFields from './MultiSelectFields'

// dictionary
import fields_glossary from "./field_options.json";
import { dictType } from '../../../api/interfaces';

interface Props {
  base_url: string
  row: dictType

  aa_seq: string
  aa_key: string

  passCustomFields: (fields: any) => void
  is_loading: boolean
  is_updating: boolean
  dataset_id: number
  gene_pos_supported: boolean
}

interface State {
    custom_fields: any[]
    show_field_modal: boolean
    options: any[]
    grouped_fields: any
    has_loaded: boolean
    gene_pos: string
    coord_type: string
}



/**
 * Customizable representation of table rows for a selected dot
 */
class SelectionView extends React.Component<Props, State> {
  constructor(props: any){
		super(props);
    this.state = { custom_fields: [], show_field_modal: false, options: [], grouped_fields: {}, has_loaded: false, gene_pos: "Select a gene to get started", coord_type: "J"}
	}


  /**
   * Fetch user configs on componenMount
   */
	componentDidMount() {
    if (this.props.dataset_id !== -1) {
      const endpoint = `http://${this.props.base_url}:5500/api/v1/data/userconfig?dataset_id=${this.props.dataset_id}`;
      fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        // catch networking errors
        if (data === undefined) {
          data = []
        }
        this.setState( {custom_fields: data.custom_fields, has_loaded: true} )

        // Update globally
        this.props.passCustomFields(data.custom_fields)
      })
    }
	}

  /**
   * 
   * @param prevProps previous Props
   */
   componentDidUpdate(prevProps: Readonly<Props>): void {

    if (prevProps.row !== this.props.row) {
      this.convertFieldsOptions()
      // convert coords
      this.formatCoord()
    }

    if (prevProps.dataset_id !== this.props.dataset_id) {
		const endpoint = `http://${this.props.base_url}:5500/api/v1/data/userconfig?dataset_id=${this.props.dataset_id}`;
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
          // catch networking errors
          if (data === undefined) {
            data = []
        }
		this.setState( {custom_fields: data.custom_fields} )
        // Update globally
        this.props.passCustomFields(data.custom_fields)
	})
    }
  }

  /**
   * Update the genomic coordinates
   */
  formatCoord(): void {
    if (this.props.gene_pos_supported) {
      const coord_formats = {
        "J": `${this.props.row.c_name}:${this.props.row.start}...${this.props.row.end}`,
        "U": `${this.props.row.c_name}:${this.props.row.start}-${this.props.row.end}`
      }
      this.setState({gene_pos: coord_formats[this.state.coord_type as keyof typeof coord_formats]})
    }
  }

  /**
   * Switch to the next supported coordinate format
   */
  nextCoordFormat(): void {
    const coord_formats = ["J", "U"]
    const now = coord_formats.lastIndexOf(this.state.coord_type)
    this.setState({coord_type: coord_formats[(now + 1) % coord_formats.length]}, () => this.formatCoord())
  }


  /*
  * Update possible field options dynamically 
  */
  convertFieldsOptions() {
    let options: { label: string; value: string; }[] = []
    const ids = new Set()
    const grouped_fields: any = {}
    // available row features
    const row_keys = Object.keys(this.props.row)
    options = row_keys.map((each: string) => {
        // match against glossary
        for (const field of fields_glossary) {
            // exact match
            if (each as string === field.value) {
              return { label: (field.label), value: each, tooltip: field.tooltip }
            } else {
              // match with suffix (c_cov_...)
              const re = new RegExp(field.value + ".*");
              if (re.test(each)) {
                  ids.add(each.charAt(each.length - 1))
                  const new_id = each.charAt(each.length - 1)

                  // add new ID
                  if (!Object.prototype.hasOwnProperty.call(grouped_fields, new_id)) {
                    const prev = grouped_fields
                    prev[new_id] = [{ label: (field.label + " (" + each + ")"), value: each, tooltip: field.tooltip }]
                    this.setState({ grouped_fields: prev})
                  // or append
                  } else {
                    const prev = grouped_fields
                    const prev_list = prev[new_id]
                    prev_list.push({ label: (field.label + " (" + each + ")"), value: each, tooltip: field.tooltip })
                  }
                  return { label: (field.label + " (" + each + ")"), value: each, tooltip: field.tooltip }
              }
            }
        }
        return { label: each, value: each }
    })

    // shuffle categories
    for (const my_id of Array.from(ids)) {
      options.unshift({ label: "(Group) ⇒ " + my_id as string, value: my_id as string })
    }
    this.setState({options: options, grouped_fields: grouped_fields})
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
     // save settings
    fetch(`http://${this.props.base_url}:5500/api/v1/data/userconfig?dataset_id=${this.props.dataset_id}`, request)
  };

  /**
   * Selection passed upwards
   * @param fields JSON
   */
  handleFieldsChange = (fields: any) => {
    const my_fields = new Set()
    for (const field of fields) {
      // filter groups
      if ((field.label as string).startsWith("(Group)")){
        for (const candidate_field of this.state.options) {
          if ((candidate_field.value as string).endsWith(field.value) && !(candidate_field.label as string).startsWith("(Group)")) {
            my_fields.add(candidate_field)
          }
        }
      } else {
        // append new field
        my_fields.add(field)
      }
    }
    this.setState({ custom_fields: Array.from(my_fields)})
    this.props.passCustomFields(my_fields)
  }

  render() {
    return(
      <Card className="m-2">
        <Card.Body>
          <Card.Title className='d-flex justify-content-between align-items-center'>
              Selected Gene { (this.props.row.plot_label === "Unassigned") && (<Badge bg="warning" className='me-auto sm'>Unassigned</Badge>)}
              <OverlayTrigger
              overlay={
                <Tooltip id={'tooltip-custom-fields'}>
                  Select additional columns generated by taXaminer to be displayed below
                </Tooltip>
              }>
                <Button className='m-2 mr-auto sm' onClick={this.showModal} type="submit">
                  <span className='bi bi-list-ul m-2'/>Manage custom fields
                </Button>
              </OverlayTrigger>
          </Card.Title>
          <Tabs defaultActiveKey="fields-tab">
            <Tab title="Fields" eventKey="fields-tab">
            <Row>
            <Col md="auto">
              <InputGroup className="m-2">
                <InputGroup.Text id="gene-info-name">Gene Name</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    contentEditable={false}
                    value={this.props.row.g_name}
                    onChange={() => false}
                  />
                  <Button onClick={() => {navigator.clipboard.writeText(this.props.row.g_name as string)}}><span className='bi bi-clipboard2'/></Button>
              </InputGroup>
            </Col>
            <Col md="auto">
                <InputGroup className="m-2">
                  <InputGroup.Text id="contig">Contig</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    contentEditable={false}
                    value={this.props.row.c_name}
                    onChange={() => false}
                  />
                  <Button onClick={() => {navigator.clipboard.writeText(this.props.row.c_name as string)}}><span className='bi bi-clipboard2'/></Button>
                </InputGroup>
              </Col>
          </Row>
          <Row>
            <Col md="auto" xs={4}>
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
            <Col md="auto">
                <InputGroup className="m-2">
                  <InputGroup.Text id="assignment">Taxon assignment</InputGroup.Text>
                    <Form.Control
                      placeholder="Selected a Gene to get started"
                      contentEditable={false}
                      value={this.props.row.taxon_assignment}
                      onChange={() => false}
                    />
                </InputGroup>
              </Col>
          </Row>
          <Row>
            <Col xs={7}>
              <InputGroup className="m-2">
                  <InputGroup.Text id="ncbi-id">Best hit</InputGroup.Text>
                    <Form.Control
                      placeholder="None"
                      contentEditable={false}
                      value={this.props.row.best_hit}
                      onChange={() => false}
                      className="w-25"
                    />
                    <InputGroup.Text id="ncbi-id">NCBI ID</InputGroup.Text>
                    <Form.Control
                    placeholder="None"
                    contentEditable={false}
                    value={this.props.row.best_hitID}
                    onChange={() => false}
                    />
                    <Button 
                    id="button.ncbi" 
                    href={'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=' + (this.props.row.best_hitID as unknown as number).toString()}
                    target="_blank">
                      <span className="bi bi-box-arrow-up-right"></span>
                    </Button>
                </InputGroup>
              </Col>
              <Col xs={5}>
                <InputGroup className="m-2">
                  <InputGroup.Text id="contig">Gene Pos</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    contentEditable={false}
                    value={this.state.gene_pos}
                    onChange={() => false}
                    disabled={!this.props.gene_pos_supported}
                  />
                  <Button disabled={!this.props.gene_pos_supported} variant='secondary' onClick={() => {this.nextCoordFormat()}}>{this.state.coord_type}</Button>
                  <Button disabled={!this.props.gene_pos_supported} onClick={() => {navigator.clipboard.writeText(this.state.gene_pos)}}><span className='bi bi-clipboard2'/></Button>
                  
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col className='md-2' xs={3}> 
                
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
                <CustomOutput id={item.label} key={item.label} col={item.value} row={this.props.row} name={item.label} tooltip={item.tooltip}/>
              ))}
            </Row>
              
            </Tab>
            <Tab title="Raw JSON" eventKey="json-tab">
              <Row>
                <Col className="m-2">
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Raw JSON <span className='bi bi-braces'/></Accordion.Header>
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
            </Tab>
            <Tab title="Amino Acid Sequence" eventKey="as-tab">
              <Row>
                <Col className="m-2">
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Amino Acid Sequence</Accordion.Header>
                        <Accordion.Body>
                          { 
                            this.props.aa_seq === "" && 
                            <Alert variant="danger">
                              <Alert.Heading>Oh snap! There is nothing here!</Alert.Heading>
                              <p>
                                We are trying to find a FASTA entry with the key stored in the column <i>{this.props.aa_key}</i>, 
                                which currently has the value of <b>{this.props.row[this.props.aa_key]}</b>. <br/>
                                <br/>
                                Please check that your <i>proteins.faa</i> file is stored correctly and readable. If this does not
                                solve the problem, please ensure that the FASTA ID formatting matches the formatting of the one ID displayed above.
                              </p>
                            </Alert>
                          }
                          { !this.props.is_updating && 
                            <div className='md-2'>
                            <pre className='pre-scrollable m-2'>
                              <code>
                              {this.props.aa_seq}
                              </code>
                            </pre>
                            </div>
                          }
                          {
                            this.props.is_updating &&
                            <Placeholder as="p" animation="glow">
                              <Placeholder xs={8}/>
                              <Placeholder xs={6}/>
                              <Placeholder xs={12}/>
                            </Placeholder>
                          }
                    </Accordion.Body>
                  </Accordion.Item>   
                </Accordion>
                <Button className='mt-2' onClick={() => {navigator.clipboard.writeText(this.props.aa_seq)}}><span className='bi bi-clipboard2'/> Copy sequence to clipboard</Button>
              </Col>
            </Row>
            </Tab>
          </Tabs>
          </Card.Body>
        </Card>
      )
  }
}

export default SelectionView