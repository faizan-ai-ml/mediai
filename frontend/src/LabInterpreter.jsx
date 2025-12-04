import React, { useState, useEffect } from 'react'
import axios from 'axios'

function LabInterpreter({ onBack }) {
  const [commonTests, setCommonTests] = useState({})
  const [labValues, setLabValues] = useState([])
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    loadCommonTests()
  }, [])

  const loadCommonTests = async () => {
    try {
      const response = await axios.get('/api/common-lab-tests')
      setCommonTests(response.data.categories)
    } catch (error) {
      console.error('Failed to load tests:', error)
    }
  }

  const addLabValue = (testName, unit) => {
    if (!labValues.find(l => l.test_name === testName)) {
      setLabValues([
        ...labValues,
        { test_name: testName, value: '', unit: unit || '' }
      ])
    }
  }

  const addCustomTest = () => {
    setLabValues([
      ...labValues,
      { test_name: '', value: '', unit: '' }
    ])
  }

  const removeLabValue = (index) => {
    setLabValues(labValues.filter((_, i) => i !== index))
  }

  const updateLabValue = (index, field, value) => {
    setLabValues(
      labValues.map((lab, i) =>
        i === index ? { ...lab, [field]: value } : lab
      )
    )
  }

  const interpretLabs = async () => {
    // Validation
    const validLabs = labValues.filter(lab => 
      lab.test_name.trim() && lab.value.toString().trim()
    )

    if (validLabs.length === 0) {
      alert('Please add at least one lab value')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/interpret-labs', {
        lab_values: validLabs,
        patient_age: age ? parseInt(age) : null,
        patient_gender: gender || null
      })
      setResults(response.data)
    } catch (error) {
      console.error('Interpretation failed:', error)
      alert('Failed to interpret labs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'critical': return '#dc2626'
      case 'high': return '#ea580c'
      case 'low': return '#3b82f6'
      case 'normal': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'critical': return '🚨'
      case 'high': return '🔴'
      case 'low': return '🔵'
      case 'normal': return '✅'
      default: return '📊'
    }
  }

  const reset = () => {
    setLabValues([])
    setResults(null)
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
              🧪 Lab Result Interpreter
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Understand your lab results in plain English
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
                Enter Your Lab Values
              </h2>

              {/* Patient Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
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

              {/* Lab Values */}
              {labValues.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                    Your Lab Values ({labValues.length}):
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {labValues.map((lab, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: '16px',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0'
                        }}
                      >
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr auto',
                          gap: '12px',
                          alignItems: 'center'
                        }}>
                          <input
                            type="text"
                            placeholder="Test name (e.g., Glucose)"
                            value={lab.test_name}
                            onChange={(e) => updateLabValue(index, 'test_name', e.target.value)}
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
                            placeholder="Value"
                            value={lab.value}
                            onChange={(e) => updateLabValue(index, 'value', e.target.value)}
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
                            placeholder="Unit"
                            value={lab.unit}
                            onChange={(e) => updateLabValue(index, 'unit', e.target.value)}
                            style={{
                              padding: '10px',
                              border: '2px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                          <button
                            onClick={() => removeLabValue(index)}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              padding: '10px 16px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Test */}
              <button
                onClick={addCustomTest}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '24px'
                }}
              >
                + Add Lab Value
              </button>

              {/* Common Tests */}
              {Object.entries(commonTests).map(([category, tests]) => (
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '8px'
                  }}>
                    {tests.map((test, idx) => (
                      <button
                        key={idx}
                        onClick={() => addLabValue(test.name, test.unit)}
                        disabled={labValues.find(l => l.test_name === test.name)}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: labValues.find(l => l.test_name === test.name)
                            ? '#e2e8f0'
                            : 'white',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          cursor: labValues.find(l => l.test_name === test.name)
                            ? 'not-allowed'
                            : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          color: '#334155'
                        }}
                        onMouseEnter={(e) => {
                          if (!labValues.find(l => l.test_name === test.name)) {
                            e.target.style.borderColor = '#667eea'
                            e.target.style.backgroundColor = '#f8fafc'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!labValues.find(l => l.test_name === test.name)) {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.backgroundColor = 'white'
                          }
                        }}
                      >
                        {test.name}
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                          ({test.unit})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Interpret Button */}
            {labValues.filter(l => l.test_name && l.value).length > 0 && (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={interpretLabs}
                  disabled={loading}
                  style={{
                    padding: '16px 48px',
                    backgroundColor: loading ? '#cbd5e1' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 6px rgba(102,126,234,0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
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
                      Analyzing...
                    </>
                  ) : (
                    '🔬 Interpret Lab Results'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Results Section */
          <div>
            {/* Overall Assessment */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '3px solid #667eea'
            }}>
              <h2 style={{
                margin: '0 0 16px 0',
                fontSize: '24px',
                color: '#667eea',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '32px' }}>📋</span>
                Overall Assessment
              </h2>
              <p style={{
                margin: 0,
                fontSize: '16px',
                color: '#334155',
                lineHeight: '1.6'
              }}>
                {results.overall_assessment}
              </p>
            </div>

            {/* Priority Concerns */}
            {results.priority_concerns && results.priority_concerns.length > 0 && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '2px solid #fde68a',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '18px',
                  color: '#92400e',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⚠️ Priority Concerns
                </h3>
                <ul style={{ margin: 0, paddingLeft: '24px' }}>
                  {results.priority_concerns.map((concern, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: '15px',
                        color: '#78350f',
                        marginBottom: '8px',
                        lineHeight: '1.6'
                      }}
                    >
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Individual Results */}
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
                Detailed Results ({results.results.length})
              </h3>

              {results.results.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    borderLeft: `5px solid ${getStatusColor(result.status)}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        color: '#1e293b',
                        fontWeight: '600'
                      }}>
                        {getStatusIcon(result.status)} {result.test_name}
                      </h4>
                      <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#64748b' }}>
                        <span><strong>Your Value:</strong> {result.value} {result.unit}</span>
                        <span><strong>Normal Range:</strong> {result.reference_range}</span>
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: getStatusColor(result.status),
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      {result.status}
                    </span>
                  </div>

                  <div style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>
                      <strong>What this test measures:</strong> {result.explanation}
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: '#e0e7ff',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#3730a3',
                      lineHeight: '1.6'
                    }}>
                      <strong>Clinical Significance:</strong> {result.clinical_significance}
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: '#dcfce7',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#166534',
                      lineHeight: '1.6'
                    }}>
                      <strong>💡 Recommendation:</strong> {result.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Actions */}
            {results.recommended_actions && results.recommended_actions.length > 0 && (
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
                  📌 Recommended Next Steps
                </h3>
                <ul style={{ margin: 0, paddingLeft: '24px' }}>
                  {results.recommended_actions.map((action, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: '15px',
                        color: '#475569',
                        marginBottom: '10px',
                        lineHeight: '1.6'
                      }}
                    >
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                <strong>⚠️ Important:</strong> This interpretation is for educational purposes only. Always discuss your lab results with your healthcare provider for proper medical advice and treatment decisions.
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
                Interpret New Results
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

export default LabInterpreter