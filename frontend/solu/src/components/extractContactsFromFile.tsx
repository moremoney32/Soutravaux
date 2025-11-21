// src/utils/fileExtractor.ts
export interface ExtractedContact {
  name: string;
  phone_number: string;
  email: string;
  isValid: boolean;
}

export const extractContactsFromFile = async (file: File, validatePhone: (phone: string) => boolean): Promise<ExtractedContact[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let contacts: ExtractedContact[] = [];

        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          contacts = processCSVFile(e.target?.result as string, validatePhone);
        } else if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx')) {
          contacts = processExcelFile(e.target?.result as ArrayBuffer, validatePhone);
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          contacts = processTXTFile(e.target?.result as string, validatePhone);
        } else {
          reject(new Error('Format de fichier non supporté'));
          return;
        }

        resolve(contacts);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    
    if (file.type.includes('sheet') || file.name.endsWith('.xlsx')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
};

const processCSVFile = (content: string, validatePhone: (phone: string) => boolean): ExtractedContact[] => {
  const contacts: ExtractedContact[] = [];
  const lines = content.split('\n');
  
  // Essayons de détecter les colonnes
  const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
  
  const nameIndex = headers.findIndex(h => h.includes('nom') || h.includes('name'));
  const phoneIndex = headers.findIndex(h => h.includes('tel') || h.includes('phone') || h.includes('telephone'));
  const emailIndex = headers.findIndex(h => h.includes('email') || h.includes('mail'));

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
    
    if (cells.length < 2) continue;

    const name = nameIndex >= 0 ? cells[nameIndex] : `Contact ${i}`;
    const phone = phoneIndex >= 0 ? cells[phoneIndex] : cells.find(cell => /[\+]?[1-9][\d]{7,15}/.test(cell)) || '';
    const email = emailIndex >= 0 ? cells[emailIndex] : cells.find(cell => cell.includes('@')) || '';

    if (phone) {
      contacts.push({
        name,
        phone_number: phone,
        email,
        isValid: validatePhone(phone)
      });
    }
  }
  
  return contacts;
};

const processExcelFile = (content: ArrayBuffer, validatePhone: (phone: string) => boolean): ExtractedContact[] => {
  // Version simplifiée - pour une vraie implémentation, utilisez une lib comme xlsx
  const text = new TextDecoder().decode(content);
  const phoneRegex = /[\+]?[1-9][\d]{7,15}/g;
  const phones = text.match(phoneRegex) || [];
  
  return phones.map((phone, index) => ({
    name: `Contact ${index + 1}`,
    phone_number: phone,
    email: "",
    isValid: validatePhone(phone)
  }));
};

const processTXTFile = (content: string, validatePhone: (phone: string) => boolean): ExtractedContact[] => {
  const phones = content.split(/[\n,;]/).filter(p => p.trim());
  
  return phones.map((phone, index) => ({
    name: `Contact ${index + 1}`,
    phone_number: phone.trim(),
    email: "",
    isValid: validatePhone(phone.trim())
  }));
};