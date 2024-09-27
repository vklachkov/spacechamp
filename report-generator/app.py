from flask import Flask, request, render_template, Response
from typing import Dict
import click
import subprocess

app = Flask(__name__)

@app.route('/', methods=['POST'])
def report_handler():
    html = render_template('report.html',
                           pages=get_rate_pages(),
                           date=get_date())

    pdf = render_html_to_pdf(html)

    return Response(pdf, mimetype='application/pdf')

def get_rate_pages():
    rates = request.get_json()
    page_size = 15
    pages = []
    
    for (i, (code, rate)) in enumerate(rates):
        participant_idx = i % page_size

        if participant_idx == 0:
            page_number = (i // page_size) + 1
            page_participants = [{} for _ in range(page_size)]
            pages.append({ 'number': page_number, 'participants': page_participants })

        pages[-1]['participants'][participant_idx] = { 'number': i + 1, 'code': code, 'rate': rate }
    
    return pages

def get_date():
    from datetime import datetime, timezone
    from zoneinfo import ZoneInfo
    
    now = datetime.now(tz=ZoneInfo('Europe/Moscow'))

    return {
        'year': now.year,
        'month': now.month,
        'day': now.day,
    }

def render_html_to_pdf(html):
    TMP_PAGE_PATH = '/tmp/html4pdf.html'
    TMP_PDF_PATH = '/tmp/pdf4user.pdf'

    with open(TMP_PAGE_PATH, 'w') as doc:
        doc.write(html)

    subprocess.run(['chromium',
                    '--headless',
                    '--disable-gpu', '--run-all-compositor-stages-before-draw',
                    '--no-margins', '--no-pdf-header-footer',
                    '--virtual-time-budget=2000',
                    f'--print-to-pdf={TMP_PDF_PATH}',
                    f'file://{TMP_PAGE_PATH}'])
    
    with open(TMP_PDF_PATH, 'rb') as pdf:
        return pdf.read()

@click.command()
@click.option('--host', type=click.STRING)
@click.option('--port', type=click.INT)
@click.option('--debug', is_flag=True)
def start_server(host: str, port: int, debug: bool):
    print(f'Listening {host}:{port}')

    if debug:
        app.run(host=host, port=port, debug=True, load_dotenv=False)
    else:
        from waitress import serve
        serve(app, host=host, port=port)

if __name__ == '__main__':
    start_server()
