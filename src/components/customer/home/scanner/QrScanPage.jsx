import { useNavigate } from "react-router-dom";

import QRScanner from "./QrScanner";

import useTableStore from "../../../../store/tableStore";

const QRScanPage = () => {

  const navigate = useNavigate();

  const resolveTable =
    useTableStore(
      (s) => s.resolveTable
    );


  const handleScan = async(token) => {

    try {

      console.log(
        "QR Token:",
        token
      );


      const table =
        await resolveTable(token);


      console.log(
        "Resolved Table:",
        table
      );


      navigate(
        "/customer/menu"
      );


    } catch(err) {

      console.error(
        "QR Resolve Failed:",
        err
      );

    }

  };


  return (

    <div
      className="
      min-h-screen
      bg-white
      p-4
      "
    >

      <h1
        className="
        text-xl
        font-bold
        mb-4
        "
      >
        Scan Table QR
      </h1>


      <QRScanner
        onScan={handleScan}
      />


    </div>

  );
};


export default QRScanPage;