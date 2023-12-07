import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';

import { Alert, Modal } from 'react-bootstrap';
import { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { Spinner } from "react-bootstrap";

// local imports
import "./customstyle.css"
import ColumnSelector from "./ColumnSelector";
import { fetchDiamond } from "../../../api";
import raw_cols from "./diamond_cols.json";
import { tableCol } from "../../../api/interfaces";

/**
 * Custom number sorting function for bootstrap-table
 * @param a first value
 * @param b second value
 * @param order asc or desc
 * @param dataField dataField ID (unused)
 * @param rowA first row
 * @param rowB second row
 * @returns sort indices for bootstrap-table
 */
const numberSort = (a: number, b: number, order: string, dataField: any, rowA: any, rowB: any) => {
    if (order === 'asc') {
      return Number(b) - Number(a);
    }
    return Number(a) - Number(b); // desc
  }

/**
 * Props of this class
 */
interface Props {
    dataset_id: number
    row: any
    base_url: string
}

interface State {
    table_data: any[]
    key: string
    loading: boolean
    custom_fields: any[]
    show_field_modal: boolean
    active_cols: tableCol[]
    is_valid: boolean
}

/**
* Diamond table
*/
class Table extends Component<Props, State> {
    constructor(props: Props){
		super(props);
		this.state ={ 
            table_data: [], 
            key: "", 
            loading: false, 
            custom_fields: [{ "label": "Seq ID", "value": "sseqid" }], 
            show_field_modal: false,
            active_cols: [
                {
                    dataField: "sseqid",
                    text: "ID",
                    sort: true,
                    filter: textFilter()
                }
            ],
            is_valid: true
        }
	}

    // raw column data for dropdown selectors
    raw_cols = require("./diamond_cols.json")

    // these are only initial values
    columns: tableCol[] = [
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

    /**
     * Set inital columns
     */
    componentDidMount(): void {
        // convert diamond_cols.json to bootstrap table format
        const text_cols = ["sseqid", "ssciname", "qseqid", "staxids" ]
        const my_cols = raw_cols.map((col: any) => {
            // define new col object for bootstrap table
            const new_col = {
                dataField: col.value,
                text: col.label,
                sort: true,
                filter: undefined,
                sortFunc: undefined,
            }
            // either allow sorting by value or searching by string
            if (text_cols.includes(col.value)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                new_col.filter = textFilter()
            } else {
                // @ts-ignore
                new_col.sortFunc = numberSort()
            }
            return new_col
        })
        this.columns = my_cols

        // default fields
        this.handleFieldsChange([
            { "label": "Seq ID", "value": "sseqid" },
            { "label": "e-value", "value": "evalue"},
            { "label": "Bitscore", "value": "bitscore"},
            { "label": "scientific name", "value": "ssciname"}])
        
    }

    /**
    * Toogle modal open
    */
    showModal = (show: boolean) => {
        this.setState({ show_field_modal: show });
    };

    /**
    * Selection passed upwards
    * @param fields JSON
    */
    handleFieldsChange = (fields: any) => {
        const new_cols = []
        // avoid tables with zero columns
        if (fields.length === 0) {
            this.setState({is_valid: false})
        } else {
            for (const field of fields) {
                for (const col of this.columns) {
                    if (col.dataField === field.value) {
                        new_cols.push(col)
                    }
                }
            }
            this.setState({ custom_fields: fields, active_cols: new_cols})

            // set valid flag if necessary
            if (!this.state.is_valid) {
                this.setState({is_valid: true})
            }
        }
    }


    // Props of parent element changed (=> selected row)
    componentDidUpdate(prevProps: Props) {
        if (prevProps.row !== this.props.row) {
            this.setState({loading: true})
            // fetch the table data
            fetchDiamond(this.props.base_url, this.props.dataset_id, this.props.row.fasta_header)
            .then(data => {
                // convert to appropriate datatype for proper sorting
                data = data.map((row: any) => { row.evalue = Number(row.evalue); return row })
                this.setState({ table_data: data, loading: false })
            }) 
        }
    }

  render() {
    return (
        <>
            <Row>
                <Col className="text-center">
                    <Button className="mt-2" style={{width: "100%"}} onClick={() => this.showModal(true)}>
                        <span className='bi bi-list-ul m-2'/>Change columns
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col className="text-center">
                    {
                    this.props.row.plot_label == "Unassigned" && 
                    <Alert className="mt-2" variant="warning">
                        <i className="bi bi-info-circle"></i> This gene was labeled as <b>Unassigned</b>. It's likely that no diamond hits are available.
                    </Alert>}
                </Col>
            </Row>
            <Row>
                <Modal show={this.state.show_field_modal} handleClose={() => this.showModal(false)}>
                    <Modal.Header>
                        <Modal.Title>Choose custom fields</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ColumnSelector
                        set_fields={this.handleFieldsChange}
                        default_fields={this.state.custom_fields}/>  
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.showModal(false)} disabled={!this.state.is_valid}>Close</Button>
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
                columns={this.state.active_cols}
                // @ts-ignore
                pagination={ paginationFactory() }
                filter={ filterFactory() }
                />
                </div>
            </Row>
        </>
      );
  }
}

export default Table;
