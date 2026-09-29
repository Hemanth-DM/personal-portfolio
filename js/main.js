/**
 * HEMANTH D.M. - Interactive 3D Portfolio Main Logic
 * Modern, High-Performance ES6 Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. SOUND EFFECTS (Web Audio API Synthesizer)
  // =========================================================================
  let soundEnabled = false;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context error ignore
    }
  }

  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      initAudio();
      soundToggleBtn.innerHTML = soundEnabled ? '🔊' : '🔇';
      soundToggleBtn.title = soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted';
      showToast(soundEnabled ? 'Audio Effects: Enabled' : 'Audio Effects: Muted');
      if (soundEnabled) playTone(587.33, 'triangle', 0.15, 0.08);
    });
  }

  // Interactive element hover sounds
  document.querySelectorAll('button, .nav-link, .btn-primary, .btn-secondary, .skill-badge').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (soundEnabled) playTone(440, 'sine', 0.04, 0.02);
    });
  });

  // =========================================================================
  // 2. THEME SWITCHER & PERSISTENCE
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeMenu = document.getElementById('theme-menu');
  const themeButtons = document.querySelectorAll('.theme-opt-btn');

  if (themeToggleBtn && themeMenu) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!themeMenu.contains(e.target) && e.target !== themeToggleBtn) {
        themeMenu.classList.remove('show');
      }
    });

    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme');
        applyTheme(selectedTheme);
        themeMenu.classList.remove('show');
      });
    });
  }

  function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('hemanth_portfolio_theme', themeName);

    // Notify Three.js Canvas
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: themeName } }));
    showToast(`Switched theme to: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`);
    if (soundEnabled) playTone(523.25, 'sine', 0.1, 0.05);
  }

  // Restore saved theme or default
  const savedTheme = localStorage.getItem('hemanth_portfolio_theme') || 'cyber';
  if (savedTheme !== 'cyber') {
    applyTheme(savedTheme);
  }

  // =========================================================================
  // 3. 3D CARD TILT EFFECT (Physics-based Parallax)
  // =========================================================================
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // =========================================================================
  // 4. TYPING ROLE ANIMATION
  // =========================================================================
  const typingElement = document.getElementById('typing-role-text');
  if (typingElement) {
    const roles = [
      "Computer Science Engineering Student",
      "Java & Python Developer",
      "JSP, Servlets & JDBC Enthusiast",
      "Analytical Problem Solver",
      "Alva's Institute of Engg & Tech"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function typeLoop() {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        typingElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 45;
      } else {
        typingElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 90;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        typingSpeed = 1800; // Pause at full text
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 400;
      }

      setTimeout(typeLoop, typingSpeed);
    }
    typeLoop();
  }

  // =========================================================================
  // 5. LIVE INDIAN STANDARD TIME (IST) CLOCK
  // =========================================================================
  const istClockEl = document.getElementById('ist-clock');
  function updateISTClock() {
    if (!istClockEl) return;
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    istClockEl.textContent = `Mandya, IN: ${now.toLocaleTimeString('en-US', options)} (IST)`;
  }
  updateISTClock();
  setInterval(updateISTClock, 1000);

  // =========================================================================
  // 6. CODE SNIPPET PREVIEW SWITCHER
  // =========================================================================
  const codeTabs = document.querySelectorAll('.code-tab-btn');
  const codePanel = document.getElementById('code-display-panel');

  const snippets = {
    java: `// ProductManagementDAO.java - Enterprise JDBC Architecture
package com.hemanth.dao;

import java.sql.*;
import java.util.*;

public class ProductDAO {
    private static final String JDBC_URL = "jdbc:mysql://localhost:3306/inventory_db";
    private static final String USER = "root";
    private static final String PASS = "admin";

    // Adds a new product record using JDBC PreparedStatement
    public boolean addProduct(int id, String name, double price, int stock) {
        String sql = "INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)";
        try (Connection con = DriverManager.getConnection(JDBC_URL, USER, PASS);
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.setString(2, name);
            ps.setDouble(3, price);
            ps.setInt(4, stock);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}`,
    python: `# text_to_audio_converter.py - Logical Workflow & File Processing
import pyttsx3
import pypdf
import os

class TextToAudioConverter:
    def __init__(self, voice_speed=150):
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', voice_speed)
        
    def extract_and_convert(self, file_path, output_audio="output.mp3"):
        """Extracts text from PDF/TXT and converts to audio output"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        extracted_text = ""
        if file_path.endswith('.pdf'):
            with open(file_path, 'rb') as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    extracted_text += page.extract_text() or ""
        else:
            with open(file_path, 'r', encoding='utf-8') as f:
                extracted_text = f.read()

        print(f"[INFO] Synthesizing {len(extracted_text)} characters into audio...")
        self.engine.save_to_file(extracted_text, output_audio)
        self.engine.runAndWait()
        return output_audio`,
    c: `/* dfa_simulator.c - Theory of Computation Simulation in C */
#include <stdio.h>
#include <stdbool.h>
#include <string.h>

// DFA that accepts binary strings ending with '01'
typedef enum { Q0, Q1, Q2 } State;

State transition(State current, char input) {
    switch (current) {
        case Q0: return (input == '0') ? Q1 : Q0;
        case Q1: return (input == '0') ? Q1 : (input == '1') ? Q2 : Q0;
        case Q2: return (input == '0') ? Q1 : Q0;
        default: return Q0;
    }
}

int main() {
    char input_string[] = "110101";
    State current_state = Q0;
    
    for (int i = 0; i < strlen(input_string); i++) {
        current_state = transition(current_state, input_string[i]);
    }
    
    if (current_state == Q2) {
        printf("String %s is ACCEPTED by the Automaton\\n", input_string);
    } else {
        printf("String %s is REJECTED\\n", input_string);
    }
    return 0;
}`
  };

  codeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      codeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const lang = tab.getAttribute('data-lang');
      if (codePanel && snippets[lang]) {
        codePanel.textContent = snippets[lang];
        if (soundEnabled) playTone(600, 'triangle', 0.05, 0.03);
      }
    });
  });

  // =========================================================================
  // 7. LIVE INTERACTIVE SANDBOX: PRODUCT MANAGEMENT SYSTEM (CRUD)
  // =========================================================================
  const initialProducts = [
    { id: 101, name: "Web Server Container", category: "Software", price: 299.00, stock: 14 },
    { id: 102, name: "JDBC Driver Bundle", category: "Database", price: 149.50, stock: 45 },
    { id: 103, name: "Servlet Engine v4.0", category: "Middleware", price: 420.00, stock: 8 },
    { id: 104, name: "MySQL Cluster Node", category: "Database", price: 680.00, stock: 19 }
  ];

  let products = [...initialProducts];
  const pmsTableBody = document.getElementById('pms-table-body');
  const sqlLogOutput = document.getElementById('sql-log-output');
  const pmsAddBtn = document.getElementById('pms-add-btn');
  const pmsResetBtn = document.getElementById('pms-reset-btn');
  const pmsSearchInput = document.getElementById('pms-search-input');

  function renderPMSTable(filteredProducts = products) {
    if (!pmsTableBody) return;
    pmsTableBody.innerHTML = '';

    if (filteredProducts.length === 0) {
      pmsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 1.5rem; color: var(--text-dim);">No product records found in database</td></tr>`;
      return;
    }

    filteredProducts.forEach(prod => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="code-font" style="color: var(--accent-cyan); font-weight: 600;">#${prod.id}</td>
        <td><strong>${escapeHtml(prod.name)}</strong></td>
        <td><span class="tech-pill" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">${escapeHtml(prod.category)}</span></td>
        <td>$${Number(prod.price).toFixed(2)}</td>
        <td>
          <span>${prod.stock}</span>
          <span class="action-icon-del" title="Delete Product (JDBC DELETE)" data-id="${prod.id}">🗑️</span>
        </td>
      `;
      pmsTableBody.appendChild(tr);
    });

    // Attach delete handlers
    pmsTableBody.querySelectorAll('.action-icon-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idToDelete = parseInt(e.target.getAttribute('data-id'), 10);
        deleteProduct(idToDelete);
      });
    });
  }

  function logSQL(query) {
    if (!sqlLogOutput) return;
    sqlLogOutput.textContent = `[JDBC Driver] Executed: ${query}`;
  }

  function addProduct() {
    const nameInput = document.getElementById('pms-name-input');
    const catInput = document.getElementById('pms-cat-input');
    const priceInput = document.getElementById('pms-price-input');
    const stockInput = document.getElementById('pms-stock-input');

    const name = nameInput.value.trim();
    const category = catInput.value.trim() || 'General';
    const price = parseFloat(priceInput.value) || 99.0;
    const stock = parseInt(stockInput.value, 10) || 10;

    if (!name) {
      showToast('Please enter a product name');
      return;
    }

    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 101;
    const newProd = { id: nextId, name, category, price, stock };
    products.push(newProd);

    // Clear inputs
    nameInput.value = '';
    catInput.value = '';
    priceInput.value = '';
    stockInput.value = '';

    renderPMSTable();
    logSQL(`INSERT INTO products (id, name, category, price, stock) VALUES (${nextId}, '${name}', '${category}', ${price}, ${stock});`);
    showToast(`Added Product #${nextId} to Database`);
    if (soundEnabled) playTone(784, 'triangle', 0.1, 0.06);
  }

  function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    renderPMSTable();
    logSQL(`DELETE FROM products WHERE id = ${id}; -- 1 row affected`);
    showToast(`Deleted Product #${id} from Database`);
    if (soundEnabled) playTone(330, 'square', 0.08, 0.04);
  }

  if (pmsAddBtn) pmsAddBtn.addEventListener('click', addProduct);
  if (pmsResetBtn) {
    pmsResetBtn.addEventListener('click', () => {
      products = [...initialProducts];
      renderPMSTable();
      logSQL(`SELECT * FROM products ORDER BY id ASC; -- Reset to initial state`);
      showToast('Database reset to defaults');
    });
  }
  if (pmsSearchInput) {
    pmsSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.id.toString().includes(q)
      );
      renderPMSTable(filtered);
      logSQL(`SELECT * FROM products WHERE name LIKE '%${q}%' OR category LIKE '%${q}%';`);
    });
  }

  renderPMSTable();

  // =========================================================================
  // 8. LIVE INTERACTIVE SANDBOX: TEXT-TO-AUDIO CONVERTER (Web Speech API)
  // =========================================================================
  const ttaTextarea = document.getElementById('tta-text');
  const ttaPlayBtn = document.getElementById('tta-play-btn');
  const ttaStopBtn = document.getElementById('tta-stop-btn');
  const ttaRateInput = document.getElementById('tta-rate');
  const ttaPitchInput = document.getElementById('tta-pitch');
  const ttaRateVal = document.getElementById('tta-rate-val');
  const ttaPitchVal = document.getElementById('tta-pitch-val');
  const ttaWaveform = document.getElementById('audio-waveform');
  const ttaPresetButtons = document.querySelectorAll('.tta-preset-btn');

  let synth = window.speechSynthesis;
  let isSpeaking = false;
  let animFrameId = null;

  const presets = {
    sample1: "Theory of Computation focuses on how efficiently problems can be solved on a model of computation, using algorithms. Key components include finite automata, formal languages, and Turing machines.",
    sample2: "Hemanth D.M. is a motivated third-year Computer Science Engineering student seeking an entry-level internship or software development opportunity in Mandya or Karnataka.",
    sample3: "The Product Management System was engineered with Java Servlets, JSP, and MySQL database connectivity via JDBC, enabling streamlined inventory records management."
  };

  ttaPresetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-preset');
      if (presets[key] && ttaTextarea) {
        ttaTextarea.value = presets[key];
        showToast('Loaded preset text');
      }
    });
  });

  if (ttaRateInput && ttaRateVal) {
    ttaRateInput.addEventListener('input', (e) => {
      ttaRateVal.textContent = `${e.target.value}x`;
    });
  }

  if (ttaPitchInput && ttaPitchVal) {
    ttaPitchInput.addEventListener('input', (e) => {
      ttaPitchVal.textContent = `${e.target.value}`;
    });
  }

  function drawWaveform(active = false) {
    if (!ttaWaveform) return;
    const ctx = ttaWaveform.getContext('2d');
    const width = ttaWaveform.width = ttaWaveform.offsetWidth;
    const height = ttaWaveform.height = ttaWaveform.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = active ? '#00f0ff' : 'rgba(255,255,255,0.15)';
    ctx.beginPath();

    const sliceWidth = width / 50;
    let x = 0;
    const time = Date.now() * 0.005;

    for (let i = 0; i < 50; i++) {
      let v = 0;
      if (active) {
        v = Math.sin(time + i * 0.3) * (height * 0.35) + Math.cos(time * 0.7 + i * 0.2) * (height * 0.15);
      }
      const y = height / 2 + v;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();

    if (active) {
      animFrameId = requestAnimationFrame(() => drawWaveform(true));
    }
  }
  drawWaveform(false);

  function speakText() {
    if (!synth) {
      showToast('Speech synthesis not supported in this browser');
      return;
    }

    const text = ttaTextarea ? ttaTextarea.value.trim() : '';
    if (!text) {
      showToast('Please enter text to synthesize into audio');
      return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (ttaRateInput) utterance.rate = parseFloat(ttaRateInput.value) || 1.0;
    if (ttaPitchInput) utterance.pitch = parseFloat(ttaPitchInput.value) || 1.0;

    utterance.onstart = () => {
      isSpeaking = true;
      if (ttaPlayBtn) ttaPlayBtn.textContent = '🔊 Synthesizing...';
      cancelAnimationFrame(animFrameId);
      drawWaveform(true);
    };

    utterance.onend = utterance.onerror = () => {
      isSpeaking = false;
      if (ttaPlayBtn) ttaPlayBtn.textContent = '▶ Convert & Play Audio';
      cancelAnimationFrame(animFrameId);
      drawWaveform(false);
    };

    synth.speak(utterance);
    showToast('Starting Audio Conversion...');
  }

  function stopSpeaking() {
    if (synth) synth.cancel();
    isSpeaking = false;
    if (ttaPlayBtn) ttaPlayBtn.textContent = '▶ Convert & Play Audio';
    cancelAnimationFrame(animFrameId);
    drawWaveform(false);
    showToast('Audio playback stopped');
  }

  if (ttaPlayBtn) ttaPlayBtn.addEventListener('click', speakText);
  if (ttaStopBtn) ttaStopBtn.addEventListener('click', stopSpeaking);

  // =========================================================================
  // 9. SEMINAR: THEORY OF COMPUTATION (TOC) FINITE STATE MACHINE (FSM)
  // =========================================================================
  const fsmInput = document.getElementById('fsm-binary-input');
  const fsmRunBtn = document.getElementById('fsm-run-btn');
  const fsmStatusOutput = document.getElementById('fsm-status-output');
  const fsmNodes = {
    q0: document.getElementById('fsm-q0'),
    q1: document.getElementById('fsm-q1'),
    q2: document.getElementById('fsm-q2')
  };

  function setFsmActiveNode(nodeId) {
    Object.keys(fsmNodes).forEach(key => {
      if (fsmNodes[key]) fsmNodes[key].classList.remove('active-state');
    });
    if (fsmNodes[nodeId]) {
      fsmNodes[nodeId].classList.add('active-state');
    }
  }

  function runFSM() {
    const inputVal = fsmInput ? fsmInput.value.trim() : '01';
    if (!/^[01]+$/.test(inputVal)) {
      showToast('Please enter a valid binary string (0 and 1 only)');
      return;
    }

    let currentState = 'q0';
    setFsmActiveNode(currentState);
    if (fsmStatusOutput) fsmStatusOutput.textContent = `Starting at initial state q0... Processing input: "${inputVal}"`;

    let step = 0;
    const interval = setInterval(() => {
      if (step >= inputVal.length) {
        clearInterval(interval);
        const isAccepted = currentState === 'q2';
        if (fsmStatusOutput) {
          fsmStatusOutput.innerHTML = isAccepted
            ? `<span style="color: #34d399; font-weight: 700;">✅ ACCEPTED! String ended at Accept State q2.</span>`
            : `<span style="color: #ef4444; font-weight: 700;">❌ REJECTED! Ended at non-accepting state ${currentState}.</span>`;
        }
        showToast(isAccepted ? 'Automata: String Accepted!' : 'Automata: String Rejected!');
        if (soundEnabled) playTone(isAccepted ? 880 : 220, 'sine', 0.2, 0.08);
        return;
      }

      const bit = inputVal[step];
      // DFA logic: accepts strings containing/ending with '01'
      if (currentState === 'q0') {
        currentState = (bit === '0') ? 'q1' : 'q0';
      } else if (currentState === 'q1') {
        currentState = (bit === '1') ? 'q2' : 'q1';
      } else if (currentState === 'q2') {
        currentState = (bit === '0') ? 'q1' : 'q0';
      }

      setFsmActiveNode(currentState);
      if (fsmStatusOutput) {
        fsmStatusOutput.textContent = `Step ${step + 1}/${inputVal.length}: Input bit '${bit}' -> Transition to state ${currentState}`;
      }
      if (soundEnabled) playTone(493.88 + step * 40, 'triangle', 0.06, 0.04);
      step++;
    }, 700);
  }

  if (fsmRunBtn) fsmRunBtn.addEventListener('click', runFSM);

  // =========================================================================
  // 10. RESUME MODAL & PRINT HANDLER
  // =========================================================================
  const resumeModal = document.getElementById('resume-modal');
  const openResumeBtns = document.querySelectorAll('.open-resume-btn');
  const closeResumeBtn = document.getElementById('close-resume-btn');
  const printResumeBtn = document.getElementById('print-resume-btn');
  const copyResumeBtn = document.getElementById('copy-resume-btn');

  function openResumeModal() {
    if (resumeModal) {
      resumeModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (soundEnabled) playTone(550, 'sine', 0.1, 0.05);
    }
  }

  function closeResumeModal() {
    if (resumeModal) {
      resumeModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  openResumeBtns.forEach(btn => btn.addEventListener('click', openResumeModal));
  if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResumeModal);

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeResumeModal();
    });
  }

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (copyResumeBtn) {
    copyResumeBtn.addEventListener('click', () => {
      const textToCopy = `HEMANTH D.M.
Mandya, Karnataka | +91 8431337157 | hemanthdm11222@gmail.com
LinkedIn: Hemanth DM | GitHub: Hemanth-DM

CAREER OBJECTIVE:
Motivated third-year Computer Science Engineering student pursuing a Bachelor of Engineering, seeking an entry-level internship or software development opportunity. Eager to apply programming fundamentals, technical skills, and problem-solving abilities to real-world projects while continuously improving technical and professional knowledge.

EDUCATION:
- Bachelor of Engineering (B.E.) – Computer Science Engineering (3rd Year, 2024 – Present)
  Alva's Institute of Engineering & Technology, Mijar
- 12th Grade / PUC (2022 – 2024)
  STG PU College, Mandya
- 10th Grade / SSLC
  Santhome Public School, Mandya

TECHNICAL SKILLS:
- Programming Languages: C, Java, Python
- Development: JSP, Servlets, JDBC, MySQL

NON-TECHNICAL SKILLS:
- Communication and Public Speaking
- Teamwork and Collaboration
- Time Management

PROJECTS:
1. Product Management System
- Designed and developed a web-based Product Management System for managing product records efficiently.
- Implemented modules for adding, updating, deleting, and displaying product information.
- Used JDBC and MySQL for database connectivity and product data management.

2. Text-to-Audio Converter
- Developed an application that converts text/PDF content into audio output.
- Applied logical problem-solving for file processing and audio conversion workflows.

CERTIFICATIONS:
- Python – Coursera
- Java – Coursera

SEMINAR:
Theory of Computation (TOC)
- Presented a 20-minute seminar covering fundamental concepts and principles of Theory of Computation.

LANGUAGES:
Kannada | English

INTERESTS:
Artificial Intelligence | Technology and Software Development | Problem Solving`;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Resume data copied to clipboard!');
      }).catch(() => {
        showToast('Failed to copy to clipboard');
      });
    });
  }

  // =========================================================================
  // 11. CONTACT FORM HANDLER
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const subject = document.getElementById('cf-subject').value.trim();
      const message = document.getElementById('cf-message').value.trim();

      if (!name || !email || !message) {
        showToast('Please complete all required fields');
        return;
      }

      // Construct mailto link
      const mailtoLink = `mailto:hemanthdm11222@gmail.com?subject=${encodeURIComponent(subject || 'Inquiry for Hemanth D.M.')}&body=${encodeURIComponent(`Hi Hemanth,\n\n${message}\n\nFrom: ${name} (${email})`)}`;
      window.location.href = mailtoLink;

      showToast('Opening your email client to send message to Hemanth...');
      contactForm.reset();
    });
  }

  // =========================================================================
  // 12. MOBILE NAVIGATION MENU
  // =========================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinksContainer = document.getElementById('nav-links');

  if (mobileMenuBtn && navLinksContainer) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinksContainer.classList.toggle('open');
      mobileMenuBtn.textContent = navLinksContainer.classList.contains('open') ? '✕' : '☰';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('open');
        if (mobileMenuBtn) mobileMenuBtn.textContent = '☰';
      });
    });
  }

  // =========================================================================
  // 13. ACTIVE NAVIGATION HIGHLIGHT ON SCROLL
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        if (navLink) navLink.classList.add('active');
      } else {
        if (navLink) navLink.classList.remove('active');
      }
    });
  }, { passive: true });

  // =========================================================================
  // 14. TOAST NOTIFICATION UTILITY
  // =========================================================================
  function showToast(message) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>⚡</span> <span>${escapeHtml(message)}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // Click-to-copy quick action for contact chips
  document.querySelectorAll('.copy-trigger').forEach(el => {
    el.addEventListener('click', (e) => {
      const val = el.getAttribute('data-copy');
      if (val) {
        navigator.clipboard.writeText(val);
        showToast(`Copied to clipboard: ${val}`);
      }
    });
  });

});
