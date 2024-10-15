import os
import shutil
from flask import Flask, request, render_template, Response
from typing import Dict
import click
import subprocess

app = Flask(__name__)

report_html_path = ""
report_pdf_path = ""

@app.route('/', methods=['POST'])
def report_handler():
    prepare_files()

    report = get_paged_report()
    html = render_template(
        'report.html',
        bureaus=report['bureaus'],
        bureaus_participants_count=report['bureaus_participants_count'],
        max_participants_per_bureau=report['max_participants_per_bureau'],
        pages=report['pages'],
        date=get_date()
    )

    pdf = render_html_to_pdf(html)

    return Response(pdf, mimetype='application/pdf')

def get_paged_report():
    r = request.get_json()
    bureaus = r['bureaus']
    bureaus_participants_count = r['bureaus_participants_count']
    max_participants_per_bureau = r['max_participants_per_bureau']
    salaries = r['salaries']

    pages = []
    page_size = 15

    for (i, rate) in enumerate(salaries):
        idx = i % page_size
        code = rate['code']
        per_bureau = rate['bureaus']

        if idx == 0:
            page_number = (i // page_size) + 1
            page_participants = [{} for _ in range(page_size)]
            pages.append({ 'number': page_number, 'participants': page_participants })

        pages[-1]['participants'][idx] = { 'number': i + 1, 'code': code, 'bureaus': per_bureau }

    return {
        'bureaus': bureaus,
        'bureaus_participants_count': bureaus_participants_count,
        'max_participants_per_bureau': max_participants_per_bureau,
        'pages': pages
    }

def get_date():
    from datetime import datetime
    from zoneinfo import ZoneInfo
    
    now = datetime.now(tz=ZoneInfo('Europe/Moscow'))

    return {
        'year': now.year,
        'month': now.month,
        'day': now.day,
    }

def render_html_to_pdf(html):
    with open(report_html_path, 'w') as doc:
        doc.write(html)

    # TODO: Replace chromium with always running firefox because chromium is very heavy and slow...
    subprocess.run(['chromium',
                    '--headless',
                    '--no-zygote',
                    '--no-sandbox',
                    '--use-fake-device-for-media-stream',
                    '--allow-file-access-from-files',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins',
                    '--disable-site-isolation-trials',
                    '--disable-gpu',
                    '--run-all-compositor-stages-before-draw',
                    '--no-margins', '--no-pdf-header-footer',
                    '--virtual-time-budget=1000',
                    f'--print-to-pdf={report_pdf_path}',
                    f'file://{report_html_path}'])
    
    with open(report_pdf_path, 'rb') as pdf:
        return pdf.read()

def prepare_files():
    global report_html_path
    global report_pdf_path
    
    print('Initializing...')

    base = '/tmp/spacechamp-report-generator'

    if os.path.exists(base):
        shutil.rmtree(base)

    os.mkdir(base)

    shutil.copytree('static/', f'{base}/static')
    
    report_html_path = f'{base}/report.html'
    with open(report_html_path, 'wb') as html: pass

    report_pdf_path = f'{base}/report.pdf'
    with open(report_pdf_path, 'wb') as pdf: pass

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
