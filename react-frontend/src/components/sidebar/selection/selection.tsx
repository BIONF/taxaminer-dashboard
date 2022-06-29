import React from 'react'
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import InputGroup from 'react-bootstrap/InputGroup';
import Col from "react-bootstrap/esm/Col";
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import CustomOutput from './custom_output';


interface SelectionData {
    row: {g_name: "Pick a gene", taxon_assignment: "Pick a gene", plot_label: "Pick a gene", best_hit: "Pick a gene", c_name: "Pick a gene", bh_evalue: 0, best_hitID: "?"};
    aa_seq: string;
}

// Information on selected scatterplot point
class SelectionView extends React.Component<any, any> {
  constructor(props: any){
		super(props);
		this.state = { table_data: [], key: "", loading: false}
    this.state = { custom_fields: []}
	}

  // Call API upon component mount
	componentDidMount() {
		const endpoint = "http://127.0.0.1:5000/api/v1/data/userconfig";
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
        // render additional components
				this.setState( {custom_fields: data.custom_fields} )
			})
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
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    contentEditable={false}
                    value={this.props.row.g_name}
                  />
              </InputGroup>
            </Col>
            <Col className="md-2">
              <InputGroup className="m-2">
                <InputGroup.Text id="gene-info-name">Label</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    contentEditable={false}
                    value={this.props.row.plot_label}
                    />
                </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col className="md-2" xs={8}>
              <InputGroup className="m-2">
                <InputGroup.Text id="gene-info-name">Best hit</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    contentEditable={false}
                    value={this.props.row.best_hit}
                  />
                </InputGroup>
            </Col>
            <Col className='md-2'>
              <InputGroup className="m-2">
                  <InputGroup.Text id="gene-info-name">ID</InputGroup.Text>
                    <Form.Control
                    placeholder="None"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
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
                  <InputGroup.Text id="gene-info-name">Contig</InputGroup.Text>
                  <Form.Control
                    placeholder="Selected a Gene to get started"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    contentEditable={false}
                    value={this.props.row.c_name}
                  />
                </InputGroup>
              </Col>
              <Col className="md-2">
                <InputGroup className="m-2">
                  <InputGroup.Text id="gene-info-name">e-value</InputGroup.Text>
                    <Form.Control
                      placeholder="Selected a Gene to get started"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      contentEditable={false}
                      value={this.props.row.bh_evalue}
                    />
                </InputGroup>
              </Col>
            </Row>
            <Row>
              { // Load custom fields from prop and render additional UI elements
              this.state.custom_fields.map((item: any) => (
                <CustomOutput id={item.id} col={item.col} row={this.props.row} name={item.name}/>
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