import React, { useState, useEffect } from 'react'
import axios from 'axios'

function DrugChecker({ onBack }) {
  const [commonMeds, setCommonMeds] = useState({})
  const [selectedMeds, setSelectedMeds] = useState([])
  const [customMed, setCustomMed] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [includeFood, setIncludeFood] = useState(true)
  const [includeAlcohol, setIncludeAlcohol] = useState(true)

  useEffect(() => {
    loadCommonMedications()
  }, [])

  const loadCommonMedications = async () => {
    try {
      const response = await axios.get('/api/common-medications')
      setCommonMeds(response.data.categories)
    } catch (error) {
      console.error('Failed to load medications:', error)
    }
  }

  const addMedication = (medName) => {
    if (!selectedMeds.find(m => m.name === medName)) {
      setSelectedMeds([
        ...selectedMeds,
        { name: medName, dosage: '', frequency: '' }
      ])
    }
  }

  const addCustomMedication = () => {
    if (customMed.trim() && !selectedMeds.find(m => m.name === customMed)) {
      setSelectedMeds([
        ...selectedMeds,
        { name: customMed, dosage: '', frequency: '' }
      ])
      setCustomMed('')
    }
  }

  const removeMedication = (medName) => {
    setSelectedMeds(selectedMeds.filter(m => m.name !== medName))
  }

  const updateMedication = (medName, field, value) => {
    setSelectedMeds(
      selectedMeds.map(m =>
        m.name === medName ? { ...m, [field]: value } : m
      )
    )
  }

  const checkInteractions = async () => {
    if (selectedMeds.length < 2) {
      alert('Please select at least 2 medications to check interactions')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/check-interactions', {
        medications: selectedMeds,
        include_food_interactions: includeFood,
        include_alcohol_interactions: includeAlcohol
      })
      setResults(response.data)
    } catch (error) {
      console.error('Check failed:', error)
      alert('Failed to check interactions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'contraindicated': return '#dc2626'
      case 'major': return '#ea580c'
      case 'moderate': return '#f59e0b'
      case 'minor': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'contraindicated': return '🚫'
      case 'major': return '⚠️'
      case 'moderate': return '⚡'
      case 'minor': return 'ℹ️'
      default: return '💊'
    }
  }

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'dangerous': return '#dc2626'
      case 'caution': return '#ea580c'
      case 'monitor': return '#f59e0b'
      case 'safe': return '#10b981'
      default: return '#6b7280'
    }
  }

  const reset = () => {
    setSelectedMeds([])
    setResults(null)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc'
    }}>
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
              💊 Drug Interaction Checker
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Check for dangerous medication interactions
            </p>
          </div>
        </div>
      </header>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto'
      }}>
        {!results ? (
          <>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#1e293b' }}>
                Select Your Medications
              </h2>

              {selectedMeds.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                    Selected ({selectedMeds.length}):
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedMeds.map(med => (
                      <div
                        key={med.name}
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: '16px',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: '600' }}>
                            {med.name}
                          </h4>
                          <button
                            onClick={() => removeMedication(med.name)}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '12px'
                        }}>
                          <input
                            type="text"
                            placeholder="Dosage (e.g., 10mg)"
                            value={med.dosage}
                            onChange={(e) => updateMedication(med.name, 'dosage', e.target.value)}
                            style={{
                              padding: '10px',
                              border: '2px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Frequency (e.g., twice daily)"
                            value={med.frequency}
                            onChange={(e) => updateMedication(med.name, 'frequency', e.target.value)}
                            style={{
                              padding: '10px',
                              border: '2px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#475569',
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Add Custom Medication:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={customMed}
                    onChange={(e) => setCustomMed(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomMedication()}
                    placeholder="Type medication name..."
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
                    onClick={addCustomMedication}
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

              {Object.entries(commonMeds).map(([category, meds]) => (
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '8px'
                  }}>
                    {meds.map(med => (
                      <button
                        key={med}
                        onClick={() => addMedication(med)}
                        disabled={selectedMeds.find(m => m.name === med)}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: selectedMeds.find(m => m.name === med)
                            ? '#e2e8f0'
                            : 'white',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          cursor: selectedMeds.find(m => m.name === med)
                            ? 'not-allowed'
                            : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          color: '#334155'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedMeds.find(m => m.name === med)) {
                            e.target.style.borderColor = '#667eea'
                            e.target.style.backgroundColor = '#f8fafc'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedMeds.find(m => m.name === med)) {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.backgroundColor = 'white'
                          }
                        }}
                      >
                        {med}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedMeds.length >= 2 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  color: '#1e293b',
                  fontWeight: '600'
                }}>
                  Additional Checks:
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={includeFood}
                      onChange={(e) => setIncludeFood(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '15px', color: '#475569' }}>
                      Check food interactions
                    </span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={includeAlcohol}
                      onChange={(e) => setIncludeAlcohol(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '15px', color: '#475569' }}>
                      Check alcohol interactions
                    </span>
                  </label>
                </div>

                <button
                  onClick={checkInteractions}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: loading ? '#cbd5e1' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 6px rgba(102,126,234,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }}></div>
                      Checking...
                    </>
                  ) : (
                    '🔍 Check for Interactions'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div>
            <div style={{
              backgroundColor: results.overall_risk === 'dangerous' ? '#fee2e2' :
                             results.overall_risk === 'caution' ? '#ffedd5' :
                             results.overall_risk === 'monitor' ? '#fef3c7' : '#f0fdf4',
              border: `3px solid ${getRiskColor(results.overall_risk)}`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: getRiskColor(results.overall_risk),
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px'
                }}>
                  {results.overall_risk === 'dangerous' ? '🚨' :
                   results.overall_risk === 'caution' ? '⚠️' :
                   results.overall_risk === 'monitor' ? '👁️' : '✅'}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    margin: '0 0 8px 0',
                    fontSize: '24px',
                    color: getRiskColor(results.overall_risk),
                    textTransform: 'uppercase',
                    fontWeight: '700'
                  }}>
                    {results.overall_risk} Risk Level
                  </h2>
                  <p style={{
                    margin: 0,
                    fontSize: '16px',
                    color: '#334155',
                    lineHeight: '1.5'
                  }}>
                    {results.general_advice}
                  </p>
                </div>
              </div>
            </div>

            {results.interactions && results.interactions.length > 0 && (
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
                  Found {results.interactions.length} Interaction{results.interactions.length !== 1 ? 's' : ''}
                </h3>

                {results.interactions.map((interaction, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '20px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      borderLeft: `5px solid ${getSeverityColor(interaction.severity)}`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '18px',
                        color: '#1e293b',
                        fontWeight: '600'
                      }}>
                        {getSeverityIcon(interaction.severity)} {interaction.drug1} + {interaction.drug2}
                      </h4>
                      <span style={{
                        backgroundColor: getSeverityColor(interaction.severity),
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {interaction.severity}
                      </span>
                    </div>

                    <div style={{
                      backgroundColor: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: '15px',
                        color: '#475569',
                        lineHeight: '1.6'
                      }}>
                        <strong>What happens:</strong> {interaction.description}
                      </p>
                    </div>

                    <div style={{
                      backgroundColor: '#e0e7ff',
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: '15px',
                        color: '#3730a3',
                        lineHeight: '1.6'
                      }}>
                        <strong>💡 Recommendation:</strong> {interaction.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.food_warnings && results.food_warnings.length > 0 && (
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
                  🍎 Food Interactions
                </h3>
                <ul style={{ margin: 0, paddingLeft: '24px' }}>
                  {results.food_warnings.map((warning, index) => (
                    <li
                      key={index}
                      style={{
                        fontSize: '15px',
                        color: '#475569',
                        marginBottom: '8px',
                        lineHeight: '1.6'
                      }}
                    >
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.alcohol_warning && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '2px solid #fde68a',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>🍺</span>
                  <div>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '18px',
                      color: '#92400e',
                      fontWeight: '600'
                    }}>
                      Alcohol Warning
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '15px',
                      color: '#78350f',
                      lineHeight: '1.6'
                    }}>
                      {results.alcohol_warning}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {results.interactions.length === 0 && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #bbf7d0',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>✅</span>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '24px',
                  color: '#166534',
                  fontWeight: '700'
                }}>
                  No Major Interactions Found
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '16px',
                  color: '#15803d',
                  lineHeight: '1.6'
                }}>
                  Your medications appear to be safe together. However, always consult your doctor or pharmacist.
                </p>
              </div>
            )}

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
                <strong>⚠️ Important:</strong> This analysis is for informational purposes only. Always consult your healthcare provider before making changes to your medications.
              </p>
            </div>

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
                Check New Medications
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

export default DrugChecker