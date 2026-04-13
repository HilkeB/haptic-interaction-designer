#include <Sparkfun_DRV2605L.h>
#include <Wire.h>

// Define pins and addresses
#define PCAADDR 0x70
#define DRVADDR 0x5A
#define SDA 41
#define SCL 40

// Define variables for serial
int deviceID = 0;
byte message[161];

// Define haptic driver objects
SFE_HMD_DRV2605L HMD[8];

void setup() {

  // Initialise serial port, don't check for connection as this can hang the program
  Serial.begin(115200);

  // Setup the I2C specifically for the Adafruit QT Py ESP32-S2
  Wire.end();
  Wire.setPins(SDA, SCL);
  Wire.begin();
  Wire.setClock(1000000);

  // Loop through all multiplexer ports and check if a haptic driver is connected
  for (int port = 0; port < 8; port++) {
    pcaselect(port);

    Wire.beginTransmission(DRVADDR);
    if (!Wire.endTransmission()) {

      // Configure the haptic driver (internal trigger, feedback controller and effect library)
      HMD[port].begin();
      HMD[port].Mode(0x00);
      HMD[port].MotorSelect(0x0A);
      HMD[port].Library(2);
    }
  }

  // // Play a small haptic sequence to check all motors work
  // pcaselect(0);
  // HMD[0].Waveform(0, 1);
  // HMD[0].Waveform(1, 0);
  // HMD[0].go();

  // pcaselect(1);
  // HMD[1].Waveform(0, 138);
  // HMD[1].Waveform(1, 1);
  // HMD[1].Waveform(2, 0);
  // HMD[1].go();

  // pcaselect(2);
  // HMD[2].Waveform(0, 148);
  // HMD[2].Waveform(1, 1);
  // HMD[2].Waveform(2, 0);
  // HMD[2].go();
}

void loop() {
  if (Serial.available() > 0) {
    // Read serial until GO byte is sent (125, 0x7D)
    int bytesRead = Serial.readBytesUntil(125, message, sizeof(message));

    bool deviceFound = false;
    int effectDelayCounter = 0;

    // Is there a possibility of a valid message? BeginSequence + DeviceID + Effect/Delay + Null + GO = 5 bytes
    if (bytesRead >= 4) {

      for (int b = 0; b < bytesRead; b++) {
        byte currentByte = message[b];

        // Is there a BeginSequence byte
        if (currentByte == 124) {
          deviceFound = true;
          continue;
        }

        // After a BeginSequence is found, extract device info from following byte
        if (deviceFound) {
          deviceID = currentByte & 15;
          bool hapticType = currentByte & 16;  //0=ERM, 1=LRA
          bool playbackType = currentByte & 32;

          // Select appropriate haptic device by ID
          pcaselect(deviceID);

          // TODO: add haptic type selection
          if (hapticType) {
            HMD[deviceID].MotorSelect(0xB9);
            HMD[deviceID].Library(6);
          }

          effectDelayCounter = 0;
          deviceFound = false;
          continue;
        }

        int effectDelay = currentByte;
        int effectDelaySlot = effectDelayCounter;

        HMD[deviceID].Waveform(effectDelaySlot, effectDelay);
        if (effectDelay == 0) {
          HMD[deviceID].go();
        }

        effectDelayCounter++;
      }

    } else {
      // TODO: add error (LED?)
    }
  }  // put your main code here, to run repeatedly:
}

void pcaselect(uint8_t i) {
  if (i > 7) return;
  delayMicroseconds(10);
  Wire.beginTransmission(PCAADDR);
  Wire.write(1 << i);  // Set the bit corresponding to the channel
  Wire.endTransmission();
}
