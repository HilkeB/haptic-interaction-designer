#include <Sparkfun_DRV2605L.h>
#include <Wire.h>

#define PCAADDR 0x70
#define DRVADDR 0x5A
#define SDA 41
#define SCL 40

int deviceID = 0;
byte message[161];

SFE_HMD_DRV2605L HMD[8];

void setup() {

  Serial.begin(115200);
  while (!Serial) delay(10);
  Serial.println("### Initialising DRV2605L haptic drivers");

  // Setup the I2C specifically for the Adafruit QT Py ESP32-S2
  Wire.end();
  Wire.setPins(SDA, SCL);
  Wire.begin();
  Wire.setClock(1000000);

  for (int port = 0; port < 8; port++) {
    pcaselect(port);

    Wire.beginTransmission(DRVADDR);
    if (!Wire.endTransmission()) {
      HMD[port].begin();
      HMD[port].MotorSelect(0x0A);
      HMD[port].Library(2);
    }
  }
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
          bool hapticType = currentByte & 16;
          bool playbackType = currentByte & 32;

          // Select appropriate haptic device by ID
          pcaselect(deviceID);

          // TODO: add haptic type selection

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