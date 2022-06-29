import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
// eslint-disable @typescript-eslint/ban-ts-comment
// @ts-ignore
import BootstrapTable from "react-bootstrap-table-next";
// @ts-ignore
import paginationFactory from 'react-bootstrap-table2-paginator';
import React, { Component } from 'react';
import { Spinner } from "react-bootstrap";
import "./customstyle.css"



class Table extends Component<any, any> {
    constructor(props: any){
		super(props);
		this.state ={ table_data: [], key: "", loading: false}
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
				    this.setState( {table_data: data}, () => {console.log(this.state)})
                    this.setState({loading: false})
			    })
        }
    }
    
    // These are preset values
    // TODO: make user selectable
    columns = [
        {
            dataField: "sseqid",
            text: "ID"
        },
        {
            dataField: "ssciname",
            text: "scientific name"
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
        <div style={{ overflow: "auto" }}>
            {this.state.loading  && <div className="text-center"><br></br><Spinner animation="border"></Spinner></div>}
            <br></br>
            <BootstrapTable 
            keyField="id" 
            data={this.state.table_data} 
            columns={this.columns}
            pagination={ paginationFactory() }
            />
        </div>
      );
  }
};

export default Table;
