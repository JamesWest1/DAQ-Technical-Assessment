
#include <iostream>
#include <fstream>
#include <dbcppp/Network.h>
#include <dbcppp/CApi.h>
#include <bit>




using canid_t = uint32_t;
struct can_frame
{
	canid_t    can_id;  /* 32 bit CAN_ID + EFF/RTR/ERR flags */
	uint8_t    can_dlc; /* frame payload length in byte (0 .. CAN_MAX_DLEN) */
	uint8_t    data[8];
    std::string canv;
    std::string timestamp;
};

void flipArray(uint8_t data[8]) {
    uint8_t tmp[8];
    for (int i = 0; i < 8; i++) {
        tmp[7-i] = data[i];
    }
    for (int i =0; i < 8; i++) {
        data[i] = tmp[i];
    }
}

void setHexBytes(uint8_t data[8], std::string datastring) {
    uint64_t x;
    std::stringstream ss;
    while (datastring.size() < 16) {
        datastring = datastring + "0";
    }
    ss << std::hex << datastring;
    ss >> x;
    *reinterpret_cast<uint64_t*>(data) = x;
    flipArray(data);
}

void loadFrame(can_frame &frame, std::ifstream &inputStream) {
    std::string timestamp = "";
    std::string canv = "";
    std::string data = "";
    inputStream >> timestamp;
    inputStream >> canv;
    inputStream >> data;
    frame.canv = canv;
    frame.timestamp = timestamp;
    if (timestamp == "") return;
    std::string canidStr = data.substr(0, data.find('#'));
    std::string datastring = "";
    if (!(data.find("#") == data.size() - 1)) datastring = data.substr(data.find("#")+1 , data.size());
    std::stringstream ss;
    ss << std::hex << canidStr;
    ss >> frame.can_id;
    setHexBytes(frame.data, datastring);
}



int main()
{
    std::unique_ptr<dbcppp::INetwork> can0;
    std::unique_ptr<dbcppp::INetwork> can1;
    std::unique_ptr<dbcppp::INetwork> can2;
    {
        std::ifstream idbc("../dbc-files/ControlBus.dbc");
        can0 = dbcppp::INetwork::LoadDBCFromIs(idbc);
        std::ifstream idbc2("../dbc-files/SensorBus.dbc");
        can1 = dbcppp::INetwork::LoadDBCFromIs(idbc2);
        std::ifstream idbc3("../dbc-files/TractiveBus.dbc");
        can2 = dbcppp::INetwork::LoadDBCFromIs(idbc3);
    }
    std::unordered_map<uint64_t, const dbcppp::IMessage *> messages0;
    for (const dbcppp::IMessage& msg : can0->Messages())
    {
        messages0.insert(std::make_pair(msg.Id(), &msg));
    }
    std::unordered_map<uint64_t, const dbcppp::IMessage *> messages1;
    for (const dbcppp::IMessage& msg : can1->Messages())
    {
        messages1.insert(std::make_pair(msg.Id(), &msg));
    }
    std::unordered_map<uint64_t, const dbcppp::IMessage *> messages2;
    for (const dbcppp::IMessage& msg : can2->Messages())
    {
        messages2.insert(std::make_pair(msg.Id(), &msg));
    }
    auto inputStream = std::ifstream{"../dump.log"};
    auto outputStream = std::ofstream{"../output.txt"};
    while (inputStream.peek() != EOF)
    {
        can_frame frame;
        loadFrame(frame, inputStream);
        if (frame.timestamp == "") break;
        std::unordered_map<uint64_t, const dbcppp::IMessage *> *messages;
        if (frame.canv == "can0") messages = &messages0;
        else if (frame.canv == "can1") messages = &messages1;
        else messages = &messages2;
        auto iter = (*messages).find(frame.can_id);
        if (iter != (*messages).end())
        {
            const dbcppp::IMessage* msg = iter->second;
            for (const dbcppp::ISignal& sig : msg->Signals())
            {
                const dbcppp::ISignal* mux_sig = msg->MuxSignal();
                if (sig.MultiplexerIndicator() != dbcppp::ISignal::EMultiplexer::MuxValue ||
                    (mux_sig && mux_sig->Decode(frame.data) == sig.MultiplexerSwitchValue()))
                {
                    double result = sig.RawToPhys(sig.Decode(frame.data));
                    outputStream << frame.timestamp << ": " << sig.Name() << ":" << result << "\n";
                }
            }
        }
    }
    return 0;
}