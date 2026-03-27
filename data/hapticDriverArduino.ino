#include "Adafruit_DRV2605.h"
#include <Wire.h>  // I2C library

#define PCAADDR 0x70  // Default I2C address of TCA9548A
Adafruit_DRV2605 drv[8];
int deviceID = 0;
byte message[161];  // Maximum serial buffer

void setup() {

  Serial.begin(115200);
  while (!Serial) delay(10);
  Serial.println("### Initialising DRV2605L haptic drivers");

  // Setup the I2C specifically for the Adafruit QT Py ESP32-S2
  Wire.end();
  Wire.setPins(41, 40);
  Wire.begin();

  // Go through all ports and I2C addresses
  for (uint8_t t = 0; t < 8; t++) {
    pcaselect(t);
    Serial.print("### PCA Port #");
    Serial.println(t);

    // Go through all I2C addresses
    for (uint8_t addr = 0; addr <= 127; addr++) {
      if (addr == PCAADDR) continue;

      // If a I2C address responds, check it out
      Wire.beginTransmission(addr);
      if (!Wire.endTransmission()) {

        // If the I2C address is 0x5A, this is a DRV2605L haptic driver
        if (addr == 90) {

          // Initialise the DRV2605L haptic driver in the correct object index
          if (!drv[t].begin()) {
            Serial.println("### Could not connect to DRV2605");
            while (1) delay(10);
          }
          Serial.println("### DRV2506L configured");

          // Initialise the driver with the default values
          drv[t].selectLibrary(1);
          drv[t].setMode(DRV2605_MODE_INTTRIG);
        }
      }
    }
  }
  Serial.println("### Starting loop");
}

void loop() {
  if (Serial.available() > 0) {
    // Read serial until GO byte is sent (125, 0x7D)
    int bytesRead = Serial.readBytesUntil(125, message, sizeof(message));

    // DEBUG
    Serial.print("### Received bytes: ");
    Serial.println(bytesRead);
    Serial.print("### Received message: ");
    for (int b = 0; b < bytesRead; b++) {
      Serial.print(message[b]);
      Serial.print(",");
    }
    Serial.println();
    // END DEBUG

    bool deviceFound = false;
    int effectDelayCounter = 0;

    // Is there a possibility of a valid message? BeginSequence + DeviceID + Effect/Delay + Null + GO = 5 bytes
    if (bytesRead >= 4) {

      for (int b = 0; b < bytesRead; b++) {
        byte currentByte = message[b];

        // Is there a BeginSequence byte
        if (currentByte == 124) {
          Serial.println("### BeginSequence byte found");
          deviceFound = true;
          continue;
        }

        // After a BeginSequence is found, extract device info from following byte
        if (deviceFound) {
          deviceID = currentByte & 15;
          bool hapticType = currentByte & 16;
          bool playbackType = currentByte & 32;

          // DEBUG
          Serial.print("### Device ID: ");
          Serial.println(deviceID);
          Serial.print("### Haptic Type: ");
          Serial.println(hapticType);
          Serial.print("### Playback Type: ");
          Serial.println(playbackType);
          // END DEBUG

          // Select appropriate haptic device by ID
          pcaselect(deviceID);

          // TODO: add haptic type selection

          effectDelayCounter = 0;
          deviceFound = false;
          continue;
        }

        int effectDelay = currentByte;
        int effectDelaySlot = effectDelayCounter;

        // DEBUG
        Serial.print("### Effect / Delay slot: ");
        Serial.println(effectDelaySlot);
        Serial.print("### Effect / Delay: ");
        Serial.println(effectDelay);
        // END DEBUG

        drv[deviceID].setWaveform(effectDelaySlot, effectDelay);

        effectDelayCounter++;
      }

      Serial.println("### Starting actuators");
      startAllHapticActuators();
    } else {
      // TODO: add error (LED?)
    }
  }
}

void pcaselect(uint8_t i) {
  if (i > 7) return;
  Wire.beginTransmission(PCAADDR);
  Wire.write(1 << i);  // Set the bit corresponding to the channel
  Wire.endTransmission();
}

void startAllHapticActuators() {
  for (int actuator = 0; actuator < 3; actuator++) {
    pcaselect(actuator);
    drv[actuator].go();
  }
}