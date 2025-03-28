use base58::FromBase58;
use bitcoincore_rpc::bitcoin::blockdata::{opcodes, script::Builder as BitcoinScriptBuilder};

use crate::types::{
    bitcoin::TxOut, BitcoinTransactionData, BitcoinTransactionMetadata, TransactionIdentifier,
};

pub fn generate_test_tx_bitcoin_p2pkh_transfer(
    txid: u64,
    _sender: &str,
    recipient: &str,
    amount: u64,
) -> BitcoinTransactionData {
    let mut hash = vec![
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    hash.append(&mut txid.to_be_bytes().to_vec());

    // Preparing metadata
    let pubkey_hash = recipient
        .from_base58()
        .expect("Unable to get bytes from btc address");
    let slice = [
        pubkey_hash[1],
        pubkey_hash[2],
        pubkey_hash[3],
        pubkey_hash[4],
        pubkey_hash[5],
        pubkey_hash[6],
        pubkey_hash[7],
        pubkey_hash[8],
        pubkey_hash[9],
        pubkey_hash[10],
        pubkey_hash[11],
        pubkey_hash[12],
        pubkey_hash[13],
        pubkey_hash[14],
        pubkey_hash[15],
        pubkey_hash[16],
        pubkey_hash[17],
        pubkey_hash[18],
        pubkey_hash[19],
        pubkey_hash[20],
    ];
    let script = BitcoinScriptBuilder::new()
        .push_opcode(opcodes::all::OP_DUP)
        .push_opcode(opcodes::all::OP_HASH160)
        .push_slice(slice)
        .push_opcode(opcodes::all::OP_EQUALVERIFY)
        .push_opcode(opcodes::all::OP_CHECKSIG)
        .into_script();
    let outputs = vec![TxOut {
        value: amount,
        script_pubkey: format!("0x{}", hex::encode(script.as_bytes())),
    }];

    BitcoinTransactionData {
        transaction_identifier: TransactionIdentifier {
            hash: format!("0x{}", hex::encode(&hash[..])),
        },
        operations: vec![],
        metadata: BitcoinTransactionMetadata {
            inputs: vec![],
            outputs,
            ordinal_operations: vec![],
            brc20_operation: None,
            proof: None,
            fee: 0,
            index: 0,
        },
    }
}
