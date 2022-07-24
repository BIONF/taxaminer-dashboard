import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
// eslint-disable @typescript-eslint/ban-ts-comment
// @ts-ignore
import BootstrapTable from "react-bootstrap-table-next";
// @ts-ignore
import paginationFactory from 'react-bootstrap-table2-paginator';
// @ts-ignore
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

// local imports
import "./customstyle.css"


class SelectionTable extends Component<any, any> {
    constructor(props: any){
		super(props);
		this.state ={ table_data: [], key: "", loading: false, custom_fields: [], show_field_modal: false}
	}

    /**
    * Selection passed upwards
    * @param fields JSON
    */
    handleFieldsChange = (fields: any) => {
        this.setState({ custom_fields: fields})
    }

    /**
     * Props of parent element changed (=> selected row)
     * @param prev_props previous selection
     */
    componentDidUpdate(prev_props: any) {
        const new_rows = []
        if (prev_props !== this.props) {
            for (let key of this.props.keys) {
                new_rows.push(this.props.master_data[key])
            }
            this.setState({table_data: new_rows})
        }
    }

    // Table events
    rowEvents = {
        /**
         * This is a premade wrapper functionn
         * @param e Click event
         * @param row raw row data (JSON)
         * @param rowIndex row Index
         */
        onClick: (e: any, row: any, rowIndex:any) => {
            this.props.passClick(row.g_name)
        }
      };
    
    // These are preset values
    // TODO: make user selectable
    columns = [
        {
            dataField: "g_name",
            text: "ID",
            sort: true,
            filter: textFilter()
        },
        {
            dataField: "bh_evalue",
            text: "Best hit e-value",
            sort: true,
        },
    ];

  render() {
    return (
        <>
            <Row className='mt-2'>
                <div style={{ overflow: "auto" }}>
                <BootstrapTable
                className="md-2"
                keyField="id" 
                data={this.state.table_data} 
                columns={this.columns}
                rowEvents={this.rowEvents}
                pagination={ paginationFactory() }
                filter={ filterFactory() }
                />
                </div>
            </Row>
        </>
      );
  }
};

export default SelectionTable;
