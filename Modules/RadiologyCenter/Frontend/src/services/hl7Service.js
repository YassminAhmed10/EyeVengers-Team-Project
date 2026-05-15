// src/services/hl7Service.js

const CLINIC_API = import.meta.env.VITE_CLINIC_API_URL || 'http://localhost:5201/api';

export const hl7Service = {
  // Build HL7 SIU^S12 (Schedule Information Unsolicited) message
  buildSIUS12Message(data) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const messageId = `MSG${now.getTime()}`;
    
    // MSH Segment - Message Header
    const msh = `MSH|^~\\&|RADIOLOGY|RADCTR|EYECLINIC|CLINIC|${timestamp}||SIU^S12|${messageId}|P|2.5`;
    
    // SCH Segment - Schedule Activity Information
    const sch = `SCH|${data.appointmentId}||${data.serviceName}^RAD|||${data.appointmentDate}|${data.appointmentTime}|||||SC|${data.orderId}`;
    
    // PID Segment - Patient Identification
    const pid = `PID|1||${data.patientId}^^^EYECLINIC^MR||${data.patientName}|||||||||||||||||||||||||`;
    
    // RGS Segment - Resource Group
    const rgs = `RGS|1|RAD`;
    
    // AIG Segment - Appointment Information - General Resource
    const aig = `AIG|1|RAD|RADIOLOGY|${data.serviceName}|||||||||`;
    
    const message = `${msh}\r${sch}\r${pid}\r${rgs}\r${aig}\r`;
    
    console.log('[HL7] Built SIU^S12 message:', message);
    return message;
  },
  
  // Build HL7 ORM^O01 (Order Message) for clinic system
  buildORMO01Message(data) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const messageId = `MSG${now.getTime()}`;
    
    // MSH Segment
    const msh = `MSH|^~\\&|RADIOLOGY|RADCTR|EYECLINIC|CLINIC|${timestamp}||ORM^O01|${messageId}|P|2.5`;
    
    // PID Segment
    const pid = `PID|1||${data.patientId}^^^EYECLINIC^MR||${data.patientName}|||||||||||||||||||||||||`;
    
    // ORC Segment - Common Order
    const orc = `ORC|NW|${data.orderId}||||||${data.appointmentDate}|||||`;
    
    // OBR Segment - Observation Request
    const obr = `OBR|1|${data.orderId}||${data.serviceCode}^${data.serviceName}^LN|||${data.appointmentDate}|||||||||||||${data.status}`;
    
    const message = `${msh}\r${pid}\r${orc}\r${obr}\r`;
    
    console.log('[HL7] Built ORM^O01 message:', message);
    return message;
  },
  
  // Send HL7 message to clinic system via API
  async sendToClinic(hl7Message) {
    try {
      const response = await fetch(`${CLINIC_API}/hl7/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          hl7Message: hl7Message
        })
      });
      
      if (!response.ok) {
        throw new Error(`HL7 send failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[HL7] Message sent successfully:', result);
      return result;
    } catch (error) {
      console.error('[HL7] Failed to send message:', error);
      throw error;
    }
  },
  
  // Parse HL7 acknowledgment
  parseAcknowledgment(ackMessage) {
    const lines = ackMessage.split('\r');
    const mshLine = lines.find(l => l.startsWith('MSH'));
    const msaLine = lines.find(l => l.startsWith('MSA'));
    
    if (!msaLine) return { accepted: false, reason: 'Invalid acknowledgment' };
    
    const fields = msaLine.split('|');
    const ackCode = fields[1]; // AA = Accept, AE = Error, AR = Reject
    
    return {
      accepted: ackCode === 'AA',
      reason: ackCode !== 'AA' ? `HL7 Error Code: ${ackCode}` : null,
      messageId: mshLine?.split('|')[9]
    };
  }
};