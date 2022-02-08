import './App.css';
import './market.css';
import { fetchCardsOf, getBalance, readCount, setCount } from './api/UseCaver';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faWallet, faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import * as KlipAPI from "./api/UseKlip";
import "bootstrap/dist/css/bootstrap.min.css"
import { Row, Col, Modal, Alert, Card, Container, Nav, Button, Form } from "react-bootstrap";
import { MARKET_CONTRACT_ADDRESS } from './constants';

const onPressButton = (_balance, _setBalance) => {
  _setBalance(_balance);
};

const DAFAULT_QR_CODE = "DEFAULT";
const DEFAULT_ADDRESS = "0x00000000000000000000000000";
//0x78DC103C5eCa7a98a9EfB5d43698bc385dfA76BA

function App() {

  const [nfts, setNfts] = useState([]); // {d: '101', Uri:''}
  const [myBalance, setMyBalance] = useState("0");
  const [myAddress, setMyAddress] = useState(DEFAULT_ADDRESS);
  // UI
  const [qrvalue, setQrvalue] = useState(DAFAULT_QR_CODE);
  const [mintImageUrl, setMintImageUrl] = useState();
  // Tap
  const [tab, setTab] = useState('MARKET') //MARKET , MINT , WALLET
  // mintInput

  // modal
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setmodalProps] = useState({
    title: "MODAL",
    onConfirm: () => { },
  });

  // gallery view
  const rows = nfts.slice(nfts.length / 2);

  // fetchMarketNFTs
  const fetchMarketNFTs = async () => {
    const _nfts = await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
    setNfts(_nfts);
  }

  // fetchMyNFTs
  const fetchMyNFTs = async () => {
    if (myAddress === DEFAULT_ADDRESS) {
      alert("NO ADDRESS");
      return;
    }
    const _nfts = await fetchCardsOf(myAddress);
    setNfts(_nfts);
  };

  // onclickMint
  const onClickMint = async (uri) => {
    if (myAddress === DEFAULT_ADDRESS) {
      alert("NO ADDRESS");
      return;
    }
    const randomTokenId = parseInt(Math.random() * 10000000);
    KlipAPI.mintCardWithURI(myAddress, randomTokenId, uri, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    })
  };

  const onClickCard = (id) => {
    if (tab === 'WALLET') {
      setmodalProps({
        title: "NFT를 마켓에 올리시겠어요?", onConfirm: () => {
          onClickMyCard(id);
        }
      })
      setShowModal(true);
    }
    if (tab === 'MARKET') {
      setmodalProps({
        title: "NFT를 구매하시겠어요?", onConfirm: () => {
          onClickMarketCard(id);
        }
      })
      setShowModal(true);
    }

  }
  // onclickMycard
  const onClickMyCard = (tokenId) => {
    KlipAPI.listingCard(myAddress, tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  }
  // onclickMarketCard
  const onClickMarketCard = (tokenId) => {
    KlipAPI.buyCard(tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  }
  // getUserData

  const getUserData = () => {
    setmodalProps({
      title: "KLIP 지갑을 연동하시겠습니까?",
      onConfirm: () => {
        KlipAPI.getAddress(setQrvalue, async (address) => {
          setMyAddress(address);
          const _balance = await getBalance(address);
          setMyBalance(_balance);
        });
      },
    });
    setShowModal(true);
  }
  // app 시작하자마자 
  useEffect(() => {
    getUserData();
    fetchMarketNFTs();
  }, [])

  return (
    <div className="App">
      <div style={{ backgroundColor: "black", padding: 10 }}>
        <div style={{
          fontSize: 30,
          fontWeight: "bold",
          paddingLeft: 5,
          marginTop: 10,
        }}>  내 지갑 </div>
        {myAddress}
        <br />
        <Alert
          onClick={getUserData}
          variant={"balance"} style={{ backgroundColor: "blue", fontSize: 25 }}>
          {myAddress !== DEFAULT_ADDRESS ? `${myBalance}KLAY` : "지갑 연동하기"}
        </Alert>

        {/* 갤러리(마켓, 내 지갑) */}
        {tab === 'MARKET' || tab === 'WALLET' ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            {rows.map((o, rowIndex) => (
              <Row key={`row_${rowIndex}`}>
                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  <Card
                    onClick={() => {
                      onClickCard(nfts[rowIndex * 2].id);
                    }}
                  >
                    <Card.Img src={nfts[rowIndex * 2].uri} />
                  </Card>
                  [{nfts[rowIndex * 2].id}]NFT
                </Col>
                <Col>
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <Card
                      onClick={() => {
                        onClickCard(nfts[rowIndex * 2 + 1].id);
                      }}
                    >
                      <Card.Img className="img-responsive" src={nfts[rowIndex * 2 + 1].uri} />
                    </Card>
                  ) : null}
                  {nfts.length > rowIndex * 2 + 1 ? <>[{nfts[rowIndex * 2 + 1].id}]NFT</> : null}
                </Col>
              </Row>
            ))}

          </div>
        ) : null}
        
      </div>



      {/* 발행 페이지 */}
      {tab === 'MINT' ? (
        <div className='container' style={{ padding: 0, width: "100%" }}>
          <Card
            className='text-center'
            style={{ color: "black", height: "50%", borderColor: "yellow" }}>
            <Card.Body style={{ opacity: 0.9, backgroundColor: "black" }}>
              {mintImageUrl !== "" ? (
                <Card.Img src={mintImageUrl} height={"50%"} />
              ) : null}
              <Form>
                <Form.Group>
                  <Form.Control
                    value={mintImageUrl}
                    onChange={(e) => {
                      console.log(e.target.value);
                      setMintImageUrl(e.target.value);
                    }}
                    type="text"
                    placeholder="이미지 주소를 입력해주세요"
                  />
                </Form.Group>
                <br />
                <Button onClick={() => { onClickMint(mintImageUrl) }} variant="primary" style={{ backgroundColor: "blue", borderColor: "blue" }}>발행하기</Button>
              </Form>
            </Card.Body>
          </Card>
          MINT</div>
      ) : null}
      {/* 모달 */}
      <br />
      <br />
      <br />
      <Modal
        centered
        size="sm"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}>
        <Modal.Header
          closeButton style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}>
          <Modal.Title>
            {modalProps.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}>
          <button variant="secondary" onClick={() => {
            setShowModal(false);
          }}
          >
            닫 기</button>
          <button
            variant="primary"
            onClick={() => {
              modalProps.onConfirm();
              setShowModal(false);
            }}
            style={{ backgroundColor: "blue", borderColor: "blue" }}
          >진 행
          </button>
        </Modal.Footer>
      </Modal>
      {/* 탭 */}
      <nav style={{ backgroundColor: "#1b1717", height: 45 }} className="navbar fixed-bottom navbar-light" role="navigation">
        <Nav className="w-100">
          <div className='d-flex flex-row justify-content-around w-100'>
            <div onClick={() => {
              setTab("MARKET");
              fetchMarketNFTs();
            }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                <FontAwesomeIcon color='white' size='lg' icon={faHome} />
              </div>
            </div>
            <div onClick={() => {
              setTab("MINT");
            }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
              <FontAwesomeIcon color='white' size='lg' icon={faPlus} />
              </div>
            </div>
            <div onClick={() => {
              setTab("WALLET");
              fetchMyNFTs();
            }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
              <FontAwesomeIcon color='white' size='lg' icon={faWallet} />
              </div>
            </div>
          </div>
        </Nav>
      </nav>
      {/* 주소 잔고 */}
      {qrvalue !== "DEFAULT" ? (
        <Container
          style={{
            backgroundColor: "white", width: 300, height: 300, padding: 20,
          }}>

          <QRCode value={qrvalue} size={256} style={{ margin: "auto" }} />
        </Container>
      ) : null}

      <br />
      <br />
      <br />

    </div>
  );
}

export default App;