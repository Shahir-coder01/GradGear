import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import json

def predict_future_sgpa(past_sgpas):
    """Predict future semester SGPAs using linear regression."""
    if len(past_sgpas) < 2:
        # Need at least 2 data points for prediction
        return None
    
    # Create features (semester numbers) and target (SGPAs)
    X = np.array(range(1, len(past_sgpas) + 1)).reshape(-1, 1)
    y = np.array(past_sgpas)
    
    # Train linear regression model
    model = LinearRegression()
    model.fit(X, y)
    
    current_sem = len(past_sgpas)
    future_semesters = np.array(range(current_sem + 1, 9)).reshape(-1, 1)

    # Only predict if there's anything to predict
    if future_semesters.size == 0:
        return {
            'future_semesters': [],
            'predicted_sgpas': [],
            'slope': float(model.coef_[0]),
            'performance_trend': 'Improving' if model.coef_[0] > 0 else 'Declining' if model.coef_[0] < 0 else 'Stable'
        }

    predictions = model.predict(future_semesters)
    
    # Cap predictions between 0 and 10
    predictions = np.clip(predictions, 0, 10)
    
    return {
        'future_semesters': future_semesters.flatten().tolist(),
        'predicted_sgpas': predictions.tolist(),
        'slope': float(model.coef_[0]),  # Trend direction
        'performance_trend': 'Improving' if model.coef_[0] > 0 else 'Declining' if model.coef_[0] < 0 else 'Stable'
    }

def identify_strengths_weaknesses(subjects_data):
    """Identify strong and weak subject areas based on marks."""
    if not subjects_data:
        return None
    
    # Group subjects by category
    categories = {
        'Mathematics': ['Mathematics', 'Calculus', 'Algebra', 'Statistics'],
        'Programming': ['Programming', 'Data Structures', 'Algorithms', 'Computing', 'Software'],
        'Electronics': ['Electronics', 'Circuits', 'Digital', 'Microprocessor'],
        'Theory': ['Theory', 'Discrete', 'Formal', 'Automata'],
        'Networks': ['Networks', 'Communication', 'Signals'],
        'Design': ['Design', 'Graphics', 'Architecture']
    }
    
    # Initialize category scores
    category_scores = {category: {'total': 0, 'count': 0} for category in categories}
    
    # Calculate average score for each category
    for subject in subjects_data:
        subject_name = subject['name']
        marks = float(subject['marks'])
        
        for category, keywords in categories.items():
            if any(keyword.lower() in subject_name.lower() for keyword in keywords):
                category_scores[category]['total'] += marks
                category_scores[category]['count'] += 1
                break
    
    # Calculate average for each category
    results = {}
    for category, data in category_scores.items():
        if data['count'] > 0:
            results[category] = data['total'] / data['count']
    
    # Identify strengths and weaknesses
    if not results:
        return {'strengths': [], 'weaknesses': []}
    
    avg_score = sum(results.values()) / len(results)
    strengths = [{'category': cat, 'score': score} for cat, score in results.items() if score > avg_score]
    weaknesses = [{'category': cat, 'score': score} for cat, score in results.items() if score <= avg_score]
    
    # Sort by score
    strengths.sort(key=lambda x: x['score'], reverse=True)
    weaknesses.sort(key=lambda x: x['score'])
    
    return {
        'strengths': strengths,
        'weaknesses': weaknesses,
        'average_score': avg_score
    }

def recommend_electives(subjects_data):
    """Recommend electives based on performance in related subjects."""
    strengths = identify_strengths_weaknesses(subjects_data)
    
    if not strengths or not strengths.get('strengths'):
        return {
            'recommended_electives': [
                'Data Science',
                'Machine Learning',
                'Web Development',
                'Cybersecurity'
            ],
            'reason': 'Based on general popularity'
        }
    
    # Define electives by category
    electives_by_category = {
        'Mathematics': ['Data Science', 'Machine Learning', 'Cryptography', 'Quantum Computing'],
        'Programming': ['Advanced Algorithms', 'Compiler Design', 'Mobile App Development', 'Cloud Computing'],
        'Electronics': ['IoT Systems', 'Embedded Systems', 'VLSI Design', 'Robotics'],
        'Theory': ['Formal Verification', 'Advanced Algorithms', 'Computational Theory', 'AI Ethics'],
        'Networks': ['Network Security', 'Cloud Computing', 'Distributed Systems', 'Wireless Communications'],
        'Design': ['UI/UX Design', 'Game Development', 'Computer Graphics', 'AR/VR Development']
    }
    
    # Recommend based on top strengths
    recommendations = []
    top_strengths = [s['category'] for s in strengths['strengths'][:2]]
    
    for category in top_strengths:
        if category in electives_by_category:
            recommendations.extend(electives_by_category[category])
    
    # If no recommendations, use default
    if not recommendations:
        recommendations = [
            'Data Science',
            'Machine Learning',
            'Web Development',
            'Cybersecurity'
        ]
        reason = 'Based on general popularity'
    else:
        recommendations = list(set(recommendations))[:4]  # Unique, top 4
        reason = f"Based on your strengths in {' and '.join(top_strengths)}"
    
    return {
        'recommended_electives': recommendations,
        'reason': reason
    }

def recommend_specialization(subjects_data):
    """Recommend master's specialization based on subject performance."""
    strengths = identify_strengths_weaknesses(subjects_data)
    
    if not strengths or not strengths.get('strengths'):
        return {
            'recommended_specializations': [
                'Computer Science',
                'Information Technology',
                'Software Engineering',
                'Artificial Intelligence'
            ],
            'reason': 'Based on general popularity'
        }
    
    # Define specializations by category
    specializations_by_category = {
        'Mathematics': ['Data Science', 'Machine Learning', 'Artificial Intelligence', 'Computational Science'],
        'Programming': ['Software Engineering', 'Programming Languages', 'Mobile Computing', 'Full Stack Development'],
        'Electronics': ['Computer Architecture', 'Embedded Systems', 'Hardware Engineering', 'Robotics'],
        'Theory': ['Theoretical Computer Science', 'Algorithms', 'Computational Theory', 'Information Theory'],
        'Networks': ['Computer Networks', 'Cybersecurity', 'Cloud Computing', 'Distributed Systems'],
        'Design': ['Human-Computer Interaction', 'Computer Graphics', 'Game Development', 'Digital Media']
    }
    
    # Recommend based on top strengths
    recommendations = []
    top_strengths = [s['category'] for s in strengths['strengths'][:2]]
    
    for category in top_strengths:
        if category in specializations_by_category:
            recommendations.extend(specializations_by_category[category])
    
    # If no recommendations, use default
    if not recommendations:
        recommendations = [
            'Computer Science',
            'Information Technology',
            'Software Engineering',
            'Artificial Intelligence'
        ]
        reason = 'Based on general popularity'
    else:
        recommendations = list(set(recommendations))[:4]  # Unique, top 4
        reason = f"Based on your strengths in {' and '.join(top_strengths)}"
    
    return {
        'recommended_specializations': recommendations,
        'reason': reason
    }