import React from 'react';
import Papa from 'papaparse';

const CsvTable = () => {
    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        Papa.parse('', {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                setData(results.data);
            }
        });
    }, []);

    return (
        <table>
            <thead>
                <tr>
                    {Object.keys(data[0]).map((key, index) => <th key={index}>{key}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {Object.values(row).map((value, index) => <td key={index}>{value}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default CsvTable;
