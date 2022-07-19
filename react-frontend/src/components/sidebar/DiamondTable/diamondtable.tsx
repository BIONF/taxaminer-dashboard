import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
// eslint-disable @typescript-eslint/ban-ts-comment
// @ts-ignore
import BootstrapTable from "react-bootstrap-table-next";
// @ts-ignore
import paginationFactory from 'react-bootstrap-table2-paginator';
// @ts-ignore
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';

import { Modal } from 'react-bootstrap';
import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { Spinner } from "react-bootstrap";

// local imports
import "./customstyle.css"
import ColumnSelector from "./ColumnSelector";


class Table extends Component<any, any> {
    constructor(props: any){
		super(props);
		this.state ={ table_data: [], key: "", loading: false, custom_fields: [], show_field_modal: false}
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


    // Props of parent element changed (=> selected row)
    componentDidUpdate(prev_props: any) {
        if (prev_props.row !== this.props.row) {
            this.setState({loading: true})
            // fetch the table data
		    const endpoint = "http://127.0.0.1:5000/api/v1/data/diamond?fasta_id=" + this.props.row.g_name;
		    fetch(endpoint)
			    .then(response => response.json())
			    .then(data => {
				    this.setState( {table_data: data} )
                    this.setState({loading: false})
			    })
        }
    }
    
    // These are preset values
    // TODO: make user selectable
    columns = [
        {
            dataField: "sseqid",
            text: "ID",
            sort: true,
            filter: textFilter()
        },
        {
            dataField: "ssciname",
            text: "scientific name",
            sort: true,
            filter: textFilter()
        },
        {
            dataField: "evalue",
            text: "e-value",
            sort: true
        },
        {
            dataField: "pident",
            text: "%-identity",
            sort: true
        },
        {
            dataField: "mismatch",
            text: "mismatches",
            sort: true
        },
    ];

  render() {
    return (
        <>
            <Row>
                <Col className="text-center">
                    <Button className="md-2" style={{width: "100%"}} onClick={() => this.showModal()}>
                        <span className='bi bi-list-ul m-2'/>Change columns
                    </Button>
                </Col>
                <Modal show={this.state.show_field_modal} handleClose={this.hideModal}>
                    <Modal.Header>
                        <Modal.Title>Choose custom fields</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ColumnSelector
                        onFieldsChange={this.handleFieldsChange}
                        default_fields={this.state.custom_fields}/>  
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.hideModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </Row>
            <Row>
                <div style={{ overflow: "auto" }}>
                {this.state.loading  && <div className="text-center"><br></br><Spinner animation="border"></Spinner></div>}
                <br></br>
                <BootstrapTable 
                keyField="id" 
                data={this.state.table_data} 
                columns={this.columns}
                pagination={ paginationFactory() }
                filter={ filterFactory() }
                />
                </div>
            </Row>
        </>
      );
  }
};

export default Table;
