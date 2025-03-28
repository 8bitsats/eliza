use bitcoind::{
    types::{
        OrdinalInscriptionNumber, OrdinalInscriptionRevealData, OrdinalInscriptionTransferData,
        OrdinalInscriptionTransferDestination,
    },
    utils::Context,
};

pub fn get_test_ctx() -> Context {
    let logger = hiro_system_kit::log::setup_logger();
    let _guard = hiro_system_kit::log::setup_global_logger(logger.clone());
    Context {
        logger: Some(logger),
        tracer: false,
    }
}

pub struct Brc20RevealBuilder {
    pub inscription_number: OrdinalInscriptionNumber,
    pub inscriber_address: Option<String>,
    pub inscription_id: String,
    pub ordinal_number: u64,
    pub parents: Vec<String>,
}

impl Default for Brc20RevealBuilder {
    fn default() -> Self {
        Self::new()
    }
}

impl Brc20RevealBuilder {
    pub fn new() -> Self {
        Brc20RevealBuilder {
            inscription_number: OrdinalInscriptionNumber {
                classic: 0,
                jubilee: 0,
            },
            inscriber_address: Some("324A7GHA2azecbVBAFy4pzEhcPT1GjbUAp".to_string()),
            inscription_id: "9bb2314d666ae0b1db8161cb373fcc1381681f71445c4e0335aa80ea9c37fcddi0"
                .to_string(),
            ordinal_number: 0,
            parents: vec![],
        }
    }

    pub fn inscription_number(mut self, val: i64) -> Self {
        self.inscription_number = OrdinalInscriptionNumber {
            classic: val,
            jubilee: val,
        };
        self
    }

    pub fn inscriber_address(mut self, val: Option<String>) -> Self {
        self.inscriber_address = val;
        self
    }

    pub fn inscription_id(mut self, val: &str) -> Self {
        self.inscription_id = val.to_string();
        self
    }

    pub fn ordinal_number(mut self, val: u64) -> Self {
        self.ordinal_number = val;
        self
    }

    pub fn parents(mut self, val: Vec<String>) -> Self {
        self.parents = val;
        self
    }

    pub fn build(self) -> OrdinalInscriptionRevealData {
        OrdinalInscriptionRevealData {
            content_bytes: "".to_string(),
            content_type: "text/plain".to_string(),
            content_length: 10,
            inscription_number: self.inscription_number,
            inscription_fee: 100,
            inscription_output_value: 10000,
            inscription_id: self.inscription_id,
            inscription_input_index: 0,
            inscription_pointer: None,
            inscriber_address: self.inscriber_address,
            delegate: None,
            metaprotocol: None,
            metadata: None,
            parents: self.parents,
            ordinal_number: self.ordinal_number,
            ordinal_block_height: 767430,
            ordinal_offset: 0,
            tx_index: 0,
            transfers_pre_inscription: 0,
            satpoint_post_inscription:
                "9bb2314d666ae0b1db8161cb373fcc1381681f71445c4e0335aa80ea9c37fcdd:0:0".to_string(),
            curse_type: None,
            charms: 0,
            unbound_sequence: None,
        }
    }
}

pub struct Brc20TransferBuilder {
    pub ordinal_number: u64,
    pub destination: OrdinalInscriptionTransferDestination,
    pub satpoint_post_transfer: String,
    pub tx_index: usize,
}

impl Default for Brc20TransferBuilder {
    fn default() -> Self {
        Self::new()
    }
}

impl Brc20TransferBuilder {
    pub fn new() -> Self {
        Brc20TransferBuilder {
            ordinal_number: 0,
            destination: OrdinalInscriptionTransferDestination::Transferred(
                "bc1pls75sfwullhygkmqap344f5cqf97qz95lvle6fvddm0tpz2l5ffslgq3m0".to_string(),
            ),
            satpoint_post_transfer:
                "e45957c419f130cd5c88cdac3eb1caf2d118aee20c17b15b74a611be395a065d:0:0".to_string(),
            tx_index: 0,
        }
    }

    pub fn ordinal_number(mut self, val: u64) -> Self {
        self.ordinal_number = val;
        self
    }

    pub fn destination(mut self, val: OrdinalInscriptionTransferDestination) -> Self {
        self.destination = val;
        self
    }

    pub fn tx_index(mut self, val: usize) -> Self {
        self.tx_index = val;
        self
    }

    pub fn build(self) -> OrdinalInscriptionTransferData {
        OrdinalInscriptionTransferData {
            ordinal_number: self.ordinal_number,
            destination: self.destination,
            satpoint_pre_transfer: "".to_string(),
            satpoint_post_transfer: self.satpoint_post_transfer,
            post_transfer_output_value: Some(500),
            tx_index: self.tx_index,
        }
    }
}
