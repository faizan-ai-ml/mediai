import React, { useState, useEffect } from 'react'
import axios from 'axios'

function SymptomChecker({ onBack }) {
  const [commonSymptoms, setCommonSymptoms] = useState({})
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [customSymptom, setCustomSymptom] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [step, setStep] = useState(1) // 1: select symptoms, 2: details, 3: results

  useEffect(() => {
    loadCommonSymptoms()
  }, [])

  const loadCommonSymptoms = async () => {
    try {
      const response = await axios.get('/api/common-symptoms')
      setCommonSymptoms(response.data.categories)
    } catch (error) {
      console.error('Failed to load symptoms:', error)
    }
  }

  const addSymptom = (symptomName) => {
    if (!selectedSymptoms.find(s => s.name === symptomName)) {
      setSelectedSymptoms([
        ...selectedSymptoms,
        { name: symptomName, severity: 5, duration_days: 1 }
      ])
    }
  }

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.find(s => s.name === customSymptom)) {
      setSelectedSymptoms([
        ...selectedSymptoms,
        { name: customSymptom, severity: 5, duration_days: 1 }
      ])
      setCustomSymptom('')
    }
  }

  const removeSymptom = (symptomName) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.name !== symptomName))
  }

  const updateSymptom = (symptomName, field, value) => {
    setSelectedSymptoms(
      selectedSymptoms.map(s =>
        s.name === symptomName ? { ...s, [field]: parseInt(value) } : s
      )
    )
  }

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/check-symptoms', {
        symptoms: selectedSymptoms,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        existing_conditions: []
      })
      setResults(response.data)
      setStep(3)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyze symptoms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return '#dc2626'
      case 'urgent': return '#ea580c'
      case 'moderate': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'emergency': return '🚨'
      case 'urgent': return '⚠️'
      case 'moderate': return '⏰'
      case 'low': return '✅'
      default: return 'ℹ️'
    }
  }

  const reset = () => {
    setSelectedSymptoms([])
    setResults(null)
    setStep(1)
    setAge('')
    setGender('')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={onBack}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
              🩺 Symptom Checker
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              AI-powered symptom analysis
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Step 1: Select Symptoms */}
        {step === 1 && (
          <>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#1e293b' }}>
                Select Your Symptoms
              </h2>

              {/* Selected Symptoms */}
              {selectedSymptoms.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                    Selected ({selectedSymptoms.length}):
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedSymptoms.map(symptom => (
                      <div
                        key={symptom.name}
                        style={{
                          backgroundColor: '#667eea',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {symptom.name}
                        <button
                          onClick={() => removeSymptom(symptom.name)}
                          style={{
                            background: 'rgba(255,255,255,0.3)',
                            border: 'none',
                            color: 'white',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: 0
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Symptom */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#475569',
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Add Custom Symptom:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
                    placeholder="Type your symptom..."
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={addCustomSymptom}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Common Symptoms by Category */}
              {Object.entries(commonSymptoms).map(([category, symptoms]) => (
                <div key={category} style={{ marginBottom: '20px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    color: '#334155',
                    marginBottom: '12px',
                    fontWeight: '600'
                  }}>
                    {category}
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '8px'
                  }}>
                    {symptoms.map(symptom => (
                      <button
                        key={symptom}
                        onClick={() => addSymptom(symptom)}
                        disabled={selectedSymptoms.find(s => s.name === symptom)}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: selectedSymptoms.find(s => s.name === symptom)
                            ? '#e2e8f0'
                            : 'white',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: selectedSymptoms.find(s => s.name === symptom)
                            ? 'not-allowed'
                            : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedSymptoms.find(s => s.name === symptom)) {
                            e.target.style.borderColor = '#667eea'
                            e.target.style.backgroundColor = '#f8fafc'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedSymptoms.find(s => s.name === symptom)) {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.backgroundColor = 'white'
                          }
                        }}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Next Button */}
            {selectedSymptoms.length > 0 && (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    padding: '16px 48px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(102,126,234,0.3)'
                  }}
                >
                  Next: Symptom Details →
                </button>
              </div>
            )}
          </>
        )}

        {/* Step 2: Symptom Details */}
        {step === 2 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#1e293b' }}>
              Provide More Details
            </h2>

            {/* Patient Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#475569',
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Age (optional)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#475569',
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Gender (optional)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Symptom Details */}
            <h3 style={{
              fontSize: '16px',
              color: '#334155',
              marginBottom: '16px',
              fontWeight: '600'
            }}>
              Rate Each Symptom:
            </h3>

            {selectedSymptoms.map(symptom => (
              <div
                key={symptom.name}
                style={{
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}
              >
                <h4 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  color: '#1e293b',
                  fontWeight: '600'
                }}>
                  {symptom.name}
                </h4>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#475569',
                    marginBottom: '8px'
                  }}>
                    Severity: {symptom.severity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={symptom.severity}
                    onChange={(e) =>
                      updateSymptom(symptom.name, 'severity', e.target.value)
                    }
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '4px'
                  }}>
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#475569',
                    marginBottom: '8px'
                  }}>
                    Duration: {symptom.duration_days} day(s)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={symptom.duration_days}
                    onChange={(e) =>
                      updateSymptom(symptom.name, 'duration_days', e.target.value)
                    }
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '4px'
                  }}>
                    <span>1 day</span>
                    <span>30+ days</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '14px 32px',
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              <button
                onClick={analyzeSymptoms}
                disabled={loading}
                style={{
                  padding: '14px 32px',
                  backgroundColor: loading ? '#cbd5e1' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 6px rgba(102,126,234,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }}></div>
                    Analyzing...
                  </>
                ) : (
                  '🔍 Analyze Symptoms'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && results && (
          <div>
            {/* Urgency Alert */}
            <div style={{
              backgroundColor: results.emergency ? '#fee2e2' : '#f0fdf4',
              border: `2px solid ${results.emergency ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>
                  {getUrgencyIcon(results.urgency_level)}
                </span>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '24px',
                    color: results.emergency ? '#991b1b' : '#166534',
                    textTransform: 'uppercase',
                    fontWeight: '700'
                  }}>
                    {results.urgency_level}
                  </h2>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '16px',
                    color: results.emergency ? '#991b1b' : '#166534',
                    fontWeight: '600'
                  }}>
                    {results.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Possible Conditions */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '20px',
                color: '#1e293b',
                fontWeight: '600'
              }}>
                Possible Conditions
              </h3>

              {results.conditions.map((condition, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    borderLeft: `4px solid ${getUrgencyColor(results.urgency_level)}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '18px',
                      color: '#1e293b',
                      fontWeight: '600'
                    }}>
                      {index + 1}. {condition.name}
                    </h4>
                    <span style={{
                      backgroundColor: '#667eea',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {Math.round(condition.probability * 100)}% likely
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#64748b',
                    lineHeight: '1.6'
                  }}>
                    {condition.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '20px',
                color: '#1e293b',
                fontWeight: '600'
              }}>
                Recommended Next Steps
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {results.next_steps.map((step, index) => (
                  <li
                    key={index}
                    style={{
                      fontSize: '15px',
                      color: '#475569',
                      marginBottom: '8px',
                      lineHeight: '1.6'
                    }}
                  >
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#92400e',
                lineHeight: '1.5'
              }}>
                <strong>⚠️ Important:</strong> This analysis is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional for proper diagnosis and treatment.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={reset}
                style={{
                  padding: '14px 32px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(102,126,234,0.3)'
                }}
              >
                Check New Symptoms
              </button>
              <button
                onClick={onBack}
                style={{
                  padding: '14px 32px',
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Chat
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default SymptomChecker