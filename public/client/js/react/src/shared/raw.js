
import React from 'react'

const Raw = ({data}) => {
    function formatJSON(json) {
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 2);
        }

        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
    return (
        <div id="raw" className="modal fade" tabIndex="-1" role="dialog" aria-labelledby="apiModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h4 id="apiModalLabel">Raw API Data</h4>
                    </div>
                    <div className="modal-body">
                        <p id="raw-body" dangerouslySetInnerHTML={{__html: formatJSON(data)}}>
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn pull-left" data-dismiss="modal" aria-hidden="true">Close</button>
                    </div>
                </div>
            </div>
        </div>
    )

}             

export default Raw;
