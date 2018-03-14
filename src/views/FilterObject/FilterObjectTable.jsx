import React, { Component } from 'react';
import { Grid, Row, Col, Table } from 'react-bootstrap';

import {thArray, tdArray} from 'variables/Variables.jsx';
class FilterObjectTable extends Component {

    constructor(props) {
      super(props);
      this.state = {
          properties: ["Object Name", "Freq", "Diff Nights", "More Than One Filter", "Num Filter", "Mag Min", "Mag Max", "Diff Date Max"],
          records: [
                ["2001_BL41",15,1,"Y",2,23.1,23.1,1],
                ["2003_CC22",1,1,"N",1,23.1,23.1,0],
                ["2003_QC112",20,12,"N",5,22.3,22.5,802],
                ["2003_UC414",29,12,"Y",5,21.9,22.1,414],
                ["2004_DA62",17,8,"N",5,22.9,23.3,406],
                ["2006_BF208",14,11,"N",5,23.9,24.3,467],
                ["2006_BZ8",22,8,"Y",5,26.1,26.6,763],
                ["2006_JG57",37,19,"N",5,23.4,24,834],
                ["2007_DP50",2,1,"Y",2,23.9,23.9,6],
                ["2007_UM126",24,11,"N",5,21.9,22.2,515],
                ["2007_VL305",8,2,"N",6,22.8,22.8,10],
                ["2008_SJ236",20,2,"Y",5,22.4,22.4,7],
                ["2008_UZ331",14,9,"N",5,22,22.2,734],
                ["2009_HH36",1,1,"N",1,19.9,19.9,0],
                ["2010_BH113",34,7,"N",6,25.8,26.5,81],
                ["2010_CN213",2,1,"N",1,26,26,2],
                ["2010_EJ104",48,14,"N",5,27.3,28.8,779],
                ["2010_ET148",2,2,"N",2,26.5,26.7,28],
                ["2010_FR31",12,3,"Y",2,26.9,27,21],
                ["2010_GX34",2,1,"Y",2,21,21,1],
                ["2010_JC147",20,9,"N",5,25.4,26.3,424],
                ["2010_JD54",14,3,"Y",5,28.3,28.6,284],
                ["2010_LP121",17,10,"Y",5,28.4,30.3,823],
                ["2010_OJ54",20,1,"Y",5,29.6,29.6,3],
                ["2010_OR1",20,9,"Y",5,27.2,27.9,377]
            ]
      };
    }

    render() {
        return (
            <Table striped hover>
                <thead>
                    <tr>
                        {
                            this.state.properties.map((prop, key) => {
                                return (
                                <th  key={key}>{prop}</th>
                                );
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        this.state.records.map((prop,key) => {
                            return (
                                <tr key={key}>{
                                    prop.map((prop,key)=> {
                                        return (
                                            <td  key={key}>{prop}</td>
                                        );
                                    })
                                }</tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        );
    }
}

export default FilterObjectTable;
