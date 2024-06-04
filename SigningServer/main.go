package main

import (
	"bytes"
	"context"
	"crypto/ecdsa"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/rlp"
	"github.com/valyala/fasthttp"
)

type txRequest struct {
	To       string `json:"to"`
	From     string `json:"from"`
	Gas      uint64 `json:"gas"`
	GasPrice string `json:"gasPrice"`
	Value    string `json:"value"`
	Data     string `json:"data"`
}

type SignedTransaction struct {
	Nonce string `json:"nonce"`
	GasPrice string `json:"gasPrice"`
	Gas string `json:"gas"`
	To string `json:"to"`
	Value string `json:"value"`
	Data string `json:"data"`
	V string `json:"v"`
	R string `json:"r"`
	S string `json:"s"`
	Hash string `json:"hash"`
}

type txResponse struct {
	SignedTx string `json:"signedTx"`
	Nonce uint64 `json:"nonce"`
	From string `json:"from"`
	To string `json:"to"`
}

type PrivateKeys struct {
	Accounts []string `json:"accounts"`
}

type Signers struct {
	ethClient *ethclient.Client
	keys map[common.Address]*ecdsa.PrivateKey
}

func NewSigners(ethClient *ethclient.Client, privateKeyFilePath string) (*Signers, error) {
	accounts, err := loadPrivateKey(privateKeyFilePath)
	if err != nil {
		return nil, err
	}
	signers :=  &Signers{
		ethClient: ethClient,
		keys: accounts,
	}
	return signers, nil
}

func (s *Signers) getPrivateKey(ctx context.Context, addr common.Address) (*ecdsa.PrivateKey, error) {
	key, ok := s.keys[addr]
	if !ok {
		return nil, fmt.Errorf("no private key for address %s", addr.Hex())
	}
	return key, nil
}
func (s *Signers) SignTx(ctx context.Context, to common.Address, from common.Address, value *big.Int, gasLimit uint64, gasPrice *big.Int, data []byte ) (*types.Transaction, error) {
	
	signer := types.FrontierSigner{}
	nonce, err := s.ethClient.PendingNonceAt(ctx, from)
	if err != nil {
		return nil, err
	}
	privateKey, err := s.getPrivateKey(ctx, from)
	if err != nil {
		return nil, err
	}
	tx := types.NewTransaction(nonce, to, value, gasLimit, gasPrice, data)
	signedTx, err := types.SignTx(tx, signer, privateKey)
	fmt.Printf("chainID: %d \n",signedTx.ChainId())
	fmt.Printf("nonce: %d \n",signedTx.Nonce())
	if err != nil {
		fmt.Printf("Failed to sign tx: %s\n", err)
		return nil, err
	}

	return signedTx, nil
}


func loadPrivateKey(filepath string) (map[common.Address]*ecdsa.PrivateKey, error) {
	data, err := os.ReadFile(filepath)
	if err != nil {
		return nil, err
	}
	var privateKeys PrivateKeys
	err = json.Unmarshal(data, &privateKeys)
	if err != nil {
		return nil, err
	}
	// create a mapping of address to private key
	accounts := make(map[common.Address]*ecdsa.PrivateKey)
	for _, key := range privateKeys.Accounts {
		key = strings.TrimPrefix(key, "0x")
		privateKey, err := crypto.HexToECDSA(key)
		if err != nil {
			return nil, err
		}
		accounts[crypto.PubkeyToAddress(privateKey.PublicKey)] = privateKey
		fmt.Printf("Loaded private key for address %s\n", crypto.PubkeyToAddress(privateKey.PublicKey).Hex())
	}
	return accounts, nil
}

func main() {

	ethNodeAddr := "http://127.0.0.1:8545"
	client, err := ethclient.Dial(ethNodeAddr)
	if err != nil {
		log.Fatal(err)
	}
	signers, err := NewSigners(client, "../testPrivateKeys.json")
	if err != nil {
		log.Fatal(err)
	}
	// Load private key from file and panic if error occurs
	priv, err := loadPrivateKey("../testPrivateKeys.json")
	if err != nil {
		log.Fatal(err)
	}
	// privKey = priv
	_ = priv
	// Create fasthttp server instance
	server := fasthttp.Server{
		Handler: func(ctx *fasthttp.RequestCtx) {
			switch string(ctx.Path()) {
			case "/sign":
				// Parse request body JSON
				var req txRequest
		
				if err := json.Unmarshal(ctx.PostBody(), &req); err != nil {
					fmt.Println(err)
					ctx.Error("Failed to parse json payload", http.StatusBadRequest)
					return
				}
				// Convert value from hex string to big.Int
				value, ok := new(big.Int).SetString(strings.TrimPrefix(req.Value, "0x"), 16)
				if !ok {
					ctx.Error("Invalid hexadecimal value", http.StatusBadRequest)
					return
				}
				// Convert value from hex string to big.Int
				gasPrice, ok := new(big.Int).SetString(strings.TrimPrefix(req.GasPrice, "0x"), 16)
				if !ok {
					ctx.Error("Invalid hexadecimal value", http.StatusBadRequest)
					return
				}
				data := common.Hex2Bytes(req.Data)
				// Create tx from request fields and sign it using private key
				toAddr := common.HexToAddress(req.To)
				fromAddr := common.HexToAddress(req.From)
				fmt.Printf("To: %s\n", toAddr.Hex())
				signedTx, err := signers.SignTx(ctx, toAddr, fromAddr, value, req.Gas, gasPrice, data)
				v, r, s := signedTx.RawSignatureValues()
				buf := new(bytes.Buffer)
				signedTxObj := SignedTransaction{
					Nonce: fmt.Sprintf("%x",signedTx.Nonce()),
					GasPrice: signedTx.GasPrice().Text(16),
					Gas: fmt.Sprintf("%x",signedTx.Gas()),
					To: signedTx.To().Hex(),
					Value: signedTx.Value().String(),
					Data: hex.EncodeToString(signedTx.Data()),
					V: v.Text(16),
					R: r.Text(16),
					S: s.Text(16),
					Hash: signedTx.Hash().Hex(),
				}
				fmt.Printf("signedTxObj: %s\n", signedTxObj)
				rlp.Encode(buf, signedTxObj)
				signedTxHex := hex.EncodeToString(buf.Bytes())
				fmt.Printf("signedTxHex: %s\n", signedTxHex)
				if err != nil {
					fmt.Printf("Failed to sign tx: %s\n", err)
					ctx.Error("Failed to sign tx", http.StatusInternalServerError)
					return
				}
				err = signedTx.EncodeRLP(buf)
				if err != nil {
					fmt.Printf("Failed to encode tx: %s\n", err)
					ctx.Error("Failed to encode tx", http.StatusInternalServerError)
					return
				}
				
				
				// Return signed tx in hex format
				fmt.Println(signedTxHex)

				ctx.SetContentType("application/json")
				res := txResponse{SignedTx: signedTxHex, Nonce: signedTx.Nonce(), From: req.From, To: req.To}
				b, err := json.Marshal(res)
				if err != nil {
					ctx.Error(err.Error(), http.StatusInternalServerError)
					return
				}
				ctx.Write(b)
			default:
				// Handle other paths here, if any...
			}
		},
	}
	server.ListenAndServe("127.0.0.1:8080")
}
